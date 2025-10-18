import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, FileText, CheckCircle, Upload, X, Loader2, FileSpreadsheet, MessageSquarePlus, Download, HelpCircle, Video, Database, Mic, MicOff, Volume2, VolumeX, Brain, CloudCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { callAI } from "@/lib/api-config";
import { Link } from "react-router-dom";
import { extractTextFromDocument, DocumentChunk, validateFileSize, isSupportedFileType } from "@/lib/document-parser";
import { vectorStore, SearchResult } from "@/lib/vector-store";
import { getCurrentUser } from "@/lib/supabase";
import { saveChatMessage, loadChatHistory, clearChatHistory } from "@/lib/chat-storage";
import { useAIMode } from "@/components/ai-mode-provider";
import { 
  saveDocument, 
  saveChunks, 
  saveEmbeddings, 
  loadDocuments, 
  loadChunksForDocument, 
  loadEmbeddingsForDocument,
  deleteDocument as deleteDocumentFromDB,
  getStorageStats 
} from "@/lib/indexed-db-storage";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface Document {
  name: string;
  status: 'ready' | 'uploading' | 'processing' | 'parsing' | 'embedding';
  size?: string;
  uploadDate?: string;
  file?: File;
  selected?: boolean;
  documentId?: string;
  totalPages?: number;
  chunksCount?: number;
  processingProgress?: number; // 0-100
}

const sampleDocuments: Document[] = [
  // You can remove these sample documents or keep them as examples
  // { name: "Model_X_Service_Manual.pdf", status: "ready", size: "2.4 MB", uploadDate: "Oct 15, 2025", selected: true },
  // { name: "Ford_F150_2023_Specs.pdf", status: "ready", size: "1.8 MB", uploadDate: "Oct 14, 2025", selected: true },
  // { name: "Technical_Bulletin_TB2024.pdf", status: "ready", size: "890 KB", uploadDate: "Oct 13, 2025", selected: true },
];

const Assistant = () => {
  const { aiMode, setAIMode } = useAIMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRestoringDocuments, setIsRestoringDocuments] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Voice input/output states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Load user and chat history on component mount
  useEffect(() => {
    const initializeUserSession = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          console.log('✅ User logged in:', user.email);
          
          // Load chat history from database
          const { messages: storedMessages, error } = await loadChatHistory();
          
          if (error) {
            console.error('Error loading chat history:', error);
          } else if (storedMessages && storedMessages.length > 0) {
            console.log(`✅ Loaded ${storedMessages.length} messages from database`);
            setMessages(storedMessages as Message[]);
          } else {
            console.log('📝 No previous chat history found');
            // Start with empty messages for clean interface
            setMessages([]);
          }
        } else {
          console.log('⚠️ No user logged in - chat history disabled');
          // Start with empty messages for non-logged-in users
          setMessages([]);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    initializeUserSession();
  }, []);

  // Restore documents from IndexedDB on mount
  useEffect(() => {
    const restoreDocuments = async () => {
      try {
        console.log('📂 Restoring documents from IndexedDB...');
        const storedDocs = await loadDocuments();
        
        if (storedDocs.length === 0) {
          console.log('📭 No stored documents found');
          setIsRestoringDocuments(false);
          return;
        }

        console.log(`📂 Found ${storedDocs.length} stored documents`);
        
        const restoredDocuments: Document[] = [];

        for (const stored of storedDocs) {
          try {
            // Load chunks and embeddings
            const [chunks, embeddingData] = await Promise.all([
              loadChunksForDocument(stored.documentId),
              loadEmbeddingsForDocument(stored.documentId)
            ]);

            if (chunks.length > 0 && embeddingData.length > 0) {
              // Restore to vector store
              const embeddings = embeddingData.map(e => e.embedding);
              await vectorStore.loadEmbeddings(chunks as DocumentChunk[], embeddings);

              // Add to UI
              restoredDocuments.push({
                name: stored.name,
                status: 'ready',
                size: formatFileSize(stored.size),
                uploadDate: new Date(stored.uploadDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }),
                selected: true,
                documentId: stored.documentId,
                totalPages: stored.totalPages,
                chunksCount: stored.chunksCount,
                processingProgress: 100,
              });

              console.log(`✅ Restored: ${stored.name} (${chunks.length} chunks)`);
            }
          } catch (docError) {
            console.error(`Error restoring ${stored.name}:`, docError);
          }
        }

        if (restoredDocuments.length > 0) {
          setDocuments(prev => [...restoredDocuments, ...prev.filter(d => !d.documentId)]);
          
          toast({
            title: "📂 Documents Restored",
            description: `Loaded ${restoredDocuments.length} document(s) from previous session`,
          });
        }

      } catch (error) {
        console.error('Error restoring documents:', error);
      } finally {
        setIsRestoringDocuments(false);
      }
    };

    restoreDocuments();
  }, []);

  // Set initialization complete when chat history loading finishes (documents can load in background)
  useEffect(() => {
    if (!isLoadingHistory) {
      setIsInitializing(false);
    }
  }, [isLoadingHistory]);

  // Initialize Speech Recognition and check browser support
  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setSpeechSupported(true);
      
      // Initialize Speech Recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Recognized:', transcript);
        setInput(transcript);
        
        toast({
          title: "🎤 Voice captured",
          description: "Your question has been transcribed",
        });
      };
      
      recognition.onerror = (event: any) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = "Voice recognition failed";
        if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please try again.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please enable it in your browser settings.";
        }
        
        toast({
          title: "Voice input error",
          description: errorMessage,
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
      console.log('⚠️ Speech recognition not supported in this browser');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeaking();
    };
  }, []);

  // Check for auto-prompt from troubleshooting page
  useEffect(() => {
    const autoPrompt = sessionStorage.getItem('autoPrompt');
    if (autoPrompt) {
      // Clear the stored prompt
      sessionStorage.removeItem('autoPrompt');
      
      // Set it as the input value and show a toast
      setInput(autoPrompt);
      
      toast({
        title: "🔧 Fixora Diagnostic Ready",
        description: "Review the pre-filled question and press Send to start diagnosis",
        duration: 5000,
      });
      
      // Scroll to input area
      setTimeout(() => {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        inputElement?.focus();
        inputElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      // Check if supported file type
      if (!isSupportedFileType(file.name)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not supported. Please upload PDF, DOCX, DOC, or TXT files`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check file size (max 100MB)
      if (!validateFileSize(file, 100)) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 100MB limit`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to documents list with uploading status
    const newDocuments: Document[] = validFiles.map(file => ({
      name: file.name,
      status: 'uploading' as const,
      size: formatFileSize(file.size),
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      file: file,
      selected: true, // Default to selected for new uploads
      processingProgress: 0,
    }));

    setDocuments(prev => [...newDocuments, ...prev]);

    // Process each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const docName = file.name;
      
      try {
        // Step 1: Parsing Document
        setDocuments(prev => 
          prev.map(d => d.name === docName && d.status === 'uploading' 
            ? { ...d, status: 'parsing' as const, processingProgress: 10 } 
            : d
          )
        );

        toast({
          title: "📄 Parsing document",
          description: `Extracting text from ${docName}... This may take a minute for large files.`,
        });

        // Add timeout wrapper for the entire parsing process
        const parsedDoc = await Promise.race([
          extractTextFromDocument(file),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Document parsing timeout (5 minutes) - file may be too large or complex')), 300000)
          )
        ]);

        if (!parsedDoc.chunks || parsedDoc.chunks.length === 0) {
          throw new Error('No text could be extracted from the document. The file may be empty, encrypted, or contain only images.');
        }

        setDocuments(prev => 
          prev.map(d => d.name === docName 
            ? { 
                ...d, 
                status: 'embedding' as const, 
                processingProgress: 40,
                documentId: parsedDoc.documentId,
                totalPages: parsedDoc.totalPages,
                chunksCount: parsedDoc.chunks.length,
              } 
            : d
          )
        );

        toast({
          title: "🧠 Generating embeddings",
          description: `Processing ${parsedDoc.chunks.length} chunks from ${docName}... First upload may take longer while downloading the AI model (~120MB).`,
          duration: 5000,
        });

        // Step 2: Generate embeddings and add to vector store with timeout
        const result = await Promise.race([
          vectorStore.addChunks(parsedDoc.chunks, (current, total) => {
            const progress = 40 + Math.floor((current / total) * 50);
            setDocuments(prev => 
              prev.map(d => d.name === docName 
                ? { ...d, processingProgress: progress } 
                : d
              )
            );
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Embedding generation timeout (10 minutes) - try splitting the document into smaller parts')), 600000)
          )
        ]);

        // Step 3: Save to IndexedDB for persistence
        try {
          await saveDocument(file, parsedDoc.documentId, parsedDoc.totalPages, parsedDoc.chunks.length);
          await saveChunks(parsedDoc.chunks);
          await saveEmbeddings(parsedDoc.chunks, result.embeddings);
          
          console.log(`💾 Saved ${docName} to IndexedDB`);
        } catch (storageError) {
          console.error('Failed to save to IndexedDB:', storageError);
          // Non-critical - continue without persistence
        }

        // Step 4: Mark as ready
        setDocuments(prev => 
          prev.map(d => d.name === docName 
            ? { ...d, status: 'ready' as const, processingProgress: 100 } 
            : d
          )
        );

        toast({
          title: "✅ Document ready",
          description: `${docName} (${parsedDoc.totalPages} pages, ${parsedDoc.chunks.length} chunks) is ready for queries`,
        });
      } catch (error) {
        console.error(`Error processing ${docName}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // More specific error messages
        let userFriendlyError = errorMessage;
        if (errorMessage.includes('timeout')) {
          userFriendlyError = `Processing took too long. Try:\n• Splitting the document into smaller files\n• Using a faster internet connection\n• Refreshing the page and trying again`;
        } else if (errorMessage.includes('No text extracted') || errorMessage.includes('No text could be extracted')) {
          userFriendlyError = `Could not extract text. The document may be:\n• A scanned image (needs OCR)\n• Password protected or encrypted\n• Corrupted or damaged`;
        } else if (errorMessage.includes('Model loading') || errorMessage.includes('embedding')) {
          userFriendlyError = `AI model loading failed. Try:\n• Checking your internet connection\n• Refreshing the page\n• Clearing browser cache`;
        }
        
        // Remove failed document
        setDocuments(prev => prev.filter(d => d.name !== docName));
        
        toast({
          title: "❌ Processing failed",
          description: userFriendlyError,
          variant: "destructive",
          duration: 10000,
        });
      }
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  // Handle click to upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove document
  const removeDocument = async (docName: string) => {
    const doc = documents.find(d => d.name === docName);
    if (doc?.documentId) {
      // Remove from vector store
      vectorStore.removeDocument(doc.documentId);
      
      // Remove from IndexedDB
      try {
        await deleteDocumentFromDB(doc.documentId);
        console.log(`💾 Deleted ${docName} from IndexedDB`);
      } catch (error) {
        console.error('Failed to delete from IndexedDB:', error);
      }
    }
    
    setDocuments(prev => prev.filter(d => d.name !== docName));
    toast({
      title: "Document removed",
      description: `${docName} has been removed from the knowledge base`,
    });
  };

  // Toggle document selection
  const toggleDocumentSelection = (docName: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.name === docName ? { ...doc, selected: !doc.selected } : doc
      )
    );
  };

  // Select/Deselect all documents
  const toggleSelectAll = () => {
    const readyDocs = documents.filter(doc => doc.status === 'ready');
    const allSelected = readyDocs.every(doc => doc.selected);
    
    setDocuments(prev => 
      prev.map(doc => 
        doc.status === 'ready' ? { ...doc, selected: !allSelected } : doc
      )
    );
  };

  // Get selected documents info
  const getSelectedDocumentsInfo = () => {
    const selectedDocs = documents.filter(doc => doc.status === 'ready' && doc.selected);
    return selectedDocs;
  };

  // Voice Input: Start listening
  const startListening = () => {
    if (!speechSupported) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser. Try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      recognitionRef.current?.start();
      toast({
        title: "🎤 Listening...",
        description: "Speak your question now",
      });
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: "Failed to start listening",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Voice Output: Speak text
  const speakText = (text: string) => {
    if (!speechSupported) {
      return;
    }

    // Stop any ongoing speech
    stopSpeaking();

    // Clean text for speech (remove markdown, emojis, special characters)
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Replace links with text
      .replace(/`([^`]+)`/g, '$1') // Remove code markers
      .replace(/📄|🔧|✅|❌|🎯|💡|🚀|⚡|📊|🔍|📚|🎥|📋|📺|🎤|🔊/g, '') // Remove emojis
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('🔊 Started speaking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      synthesisRef.current = null;
      console.log('🔊 Finished speaking');
    };

    utterance.onerror = (event) => {
      console.error('🔊 Speech synthesis error:', event);
      setIsSpeaking(false);
      synthesisRef.current = null;
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      synthesisRef.current = null;
      console.log('🔊 Speech stopped');
    }
  };

  // Toggle speaking
  const toggleSpeaking = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(text);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userQuestion = input;
    setInput("");
    setIsLoading(true);

    try {
      // Check if we're in local model mode
      if (aiMode === 'local-model') {
        // Use local ML model - no documents needed
        toast({
          title: "🧠 Analyzing with Local Model",
          description: "Processing your question with pre-trained model...",
        });

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/local-model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: userQuestion })
        });

        if (!response.ok) {
          throw new Error('Local model API request failed');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Unknown error from local model');
        }

        // Format response with problem and solution
        const assistantMessage: Message = {
          role: 'assistant',
          content: `**🔍 Diagnosis:**\n${result.problem}\n\n**🔧 Recommended Solution:**\n${result.solution}\n\n---\n\n*Confidence: Problem ${(result.confidence?.problem * 100).toFixed(0)}%, Solution ${(result.confidence?.solution * 100).toFixed(0)}%*\n${result.vehicle_company ? `\n*Vehicle: ${result.vehicle_company}*` : ''}\n${result.source ? `\n*Source: ${result.source}*` : ''}`,
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save to history if user is logged in
        if (currentUser) {
          await saveChatMessage(userMessage);
          await saveChatMessage(assistantMessage);
        }

        setIsLoading(false);

        toast({
          title: "✅ Diagnosis Complete",
          description: "Found solution from trained model",
        });

        return;
      }

      // RAG Mode - original document-based logic
      const selectedDocs = getSelectedDocumentsInfo();
    
      if (selectedDocs.length === 0) {
        toast({
          title: "No documents selected",
          description: "Please select at least one document for the AI to reference",
          variant: "destructive",
        });
        setIsLoading(false);
        setMessages(prev => prev.slice(0, -1)); // Remove the user message
        setInput(userQuestion); // Restore the input
        return;
      }
      // Retrieve relevant chunks from selected documents using RAG
      const selectedDocIds = selectedDocs
        .filter(doc => doc.documentId)
        .map(doc => doc.documentId!);

      if (selectedDocIds.length === 0) {
        throw new Error("Selected documents are not yet processed. Please wait for processing to complete.");
      }

      toast({
        title: "🔍 Searching documents",
        description: `Retrieving relevant information from ${selectedDocs.length} document(s)...`,
      });

      // Search vector store for relevant chunks
      const searchResults: SearchResult[] = await vectorStore.search(
        userQuestion, 
        10, // Get top 10 most relevant chunks
        selectedDocIds
      );

      // Check if results are relevant enough (similarity threshold)
      const SIMILARITY_THRESHOLD = 0.3; // Minimum similarity score to consider relevant
      const relevantResults = searchResults.filter(r => r.similarity >= SIMILARITY_THRESHOLD);

      if (relevantResults.length === 0) {
        // No relevant information found in documents
        const noInfoMsg: Message = {
          role: 'assistant',
          content: `❌ **No Relevant Information Found**\n\nI couldn't find any information related to "${userQuestion}" in your uploaded documents.\n\n**Possible reasons:**\n1. 📄 **Not in documents**: The information doesn't exist in your uploaded manuals\n2. � **Different terminology**: Try rephrasing using terms from the manual\n3. � **Wrong documents**: This topic might be in a different manual\n4. ❓ **Off-topic**: Question may not be related to vehicle service/repair\n\n**What I can help with:**\n- ✅ Questions about content **in your uploaded documents**\n- ✅ Vehicle repair procedures **from the manuals**\n- ✅ Technical specifications **documented in PDFs**\n- ✅ Diagnostic codes **if covered in uploaded files**\n\n💡 **Tips:**\n- Upload relevant service manuals for your vehicle\n- Ask about topics covered in the uploaded documents\n- Use terminology similar to what's in the manual\n- Check if the right document is selected (☑️)`,
        };
        setMessages(prev => [...prev, noInfoMsg]);
        setIsLoading(false);
        
        toast({
          title: "❌ No relevant content",
          description: "Question not covered in uploaded documents",
          variant: "destructive",
        });
        return;
      }

      // Build context from retrieved chunks
      const context = relevantResults
        .map((result, idx) => 
          `[Source ${idx + 1}: ${result.chunk.documentName}, Page ${result.chunk.pageNumber}, Relevance: ${(result.similarity * 100).toFixed(1)}%]\n${result.chunk.text}`
        )
        .join('\n\n---\n\n');

      // Get unique sources for citation
      const uniqueSources = [...new Set(relevantResults.map(r => 
        `${r.chunk.documentName} (Page ${r.chunk.pageNumber})`
      ))];

      // Call AI with RAG context - AI will ONLY use this context
      const systemPrompt = `You are a vehicle service assistant using RAG (Retrieval-Augmented Generation). You must STRICTLY follow these rules:

🔒 **CRITICAL RULES:**
1. Answer ONLY using information from the CONTEXT provided below
2. DO NOT use any external knowledge, general AI knowledge, or assumptions
3. If the CONTEXT doesn't contain the answer, you MUST say: "I don't have information about that in the uploaded documents."
4. ALWAYS cite sources when answering (e.g., "According to [Source 1, Page X]...")
5. If the question is unrelated to the document content, politely decline to answer

📋 **Response Format:**
- Start with the answer from the context
- Include specific details (measurements, torque specs, steps) from the context
- End with source citations
- Use clear formatting with bullet points and sections

⚠️ **What to do if:**
- Context is insufficient → Say "I don't have enough information in the documents"
- Question is off-topic → Say "This question is not covered in your uploaded documents"
- Multiple interpretations → Ask for clarification

CONTEXT FROM UPLOADED DOCUMENTS:
${context}

Remember: You are a DOCUMENT-BASED assistant. Your knowledge is LIMITED to what's in the context above. Do not invent, assume, or use general knowledge.`;

      const result = await callAI(
        userQuestion,
        [],
        systemPrompt
      );
      
      const aiMessage: Message = {
        role: 'assistant',
        content: result.answer,
        sources: uniqueSources.slice(0, 5), // Show top 5 sources
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Auto-speak the response if speech is supported
      if (speechSupported && result.answer) {
        setTimeout(() => {
          speakText(result.answer);
        }, 500); // Small delay to ensure message is rendered
      }
      
      // Save messages to database if user is logged in
      if (currentUser) {
        try {
          // Save user message
          await saveChatMessage({
            role: 'user',
            content: userQuestion,
          });
          
          // Save assistant response
          await saveChatMessage({
            role: 'assistant',
            content: result.answer,
            sources: uniqueSources.slice(0, 5),
          });
          
          console.log('✅ Messages saved to database');
        } catch (saveError) {
          console.error('⚠️ Failed to save messages:', saveError);
          // Don't show error to user - chat still works locally
        }
      } else {
        console.log('⚠️ User not logged in - messages not saved to database');
      }
      
      toast({
        title: "✅ Response generated",
        description: `Answer based on ${searchResults.length} relevant chunks from your documents`,
      });
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Add error message to chat
      const errorMsg: Message = {
        role: 'assistant',
        content: `❌ **Error**: ${errorMessage}\n\n**Troubleshooting:**\n- Ensure all selected documents are fully processed (status: ready)\n- Check if your Groq API key is configured in .env file\n- Verify your API key is valid at https://console.groq.com/\n- Try rephrasing your question or selecting different documents`,
      };
      setMessages(prev => [...prev, errorMsg]);
      
      toast({
        title: "Failed to get AI response",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate conversation summary
  const handleGenerateSummary = async () => {
    if (messages.length <= 1) {
      toast({
        title: "No conversation to summarize",
        description: "Start a conversation first to generate a summary",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Build conversation history
      const conversationHistory = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map((msg, idx) => `${idx + 1}. ${msg.role === 'user' ? 'Question' : 'Answer'}: ${msg.content}`)
        .join('\n\n');

      const selectedDocs = getSelectedDocumentsInfo();
      
      // Call AI to generate summary
      const result = await callAI(
        `Please provide a concise summary of this vehicle service conversation. Focus on:\n1. What issues or questions were discussed\n2. What solutions or information were provided\n3. Key technical details, specifications, or procedures mentioned\n4. Any important warnings or recommendations\n\nConversation:\n${conversationHistory}`,
        selectedDocs.map(doc => doc.name)
      );
      
      const summaryMessage: Message = {
        role: 'assistant',
        content: `📋 **Conversation Summary**\n\n${result.answer}`,
      };
      
      setMessages(prev => [...prev, summaryMessage]);
      
      toast({
        title: "Summary generated",
        description: "Conversation summary has been added to the chat",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Failed to generate summary",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Suggest relevant video tutorials based on conversation
  const handleSuggestVideos = async () => {
    if (messages.length <= 1) {
      toast({
        title: "No conversation to analyze",
        description: "Start a conversation first to get video suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Build conversation context
      const conversationContext = messages
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join(' ');

      const selectedDocs = getSelectedDocumentsInfo();
      
      // Call AI to analyze and suggest videos
      const result = await callAI(
        `Based on this vehicle service conversation, suggest 3-5 relevant video tutorial topics that would help the user fix the issues discussed.

Conversation topics: ${conversationContext}

For each suggestion, provide:
1. A descriptive tutorial title
2. The difficulty level (Beginner/Intermediate/Advanced)
3. A brief explanation of why this video would be helpful (1 sentence)

Format your response as:
**🎥 Video Tutorial #1: [Title]**
Difficulty: [Level]
Why helpful: [Reason]

**🎥 Video Tutorial #2: [Title]**
...

Focus on practical, hands-on repair and diagnostic videos that directly relate to the issues discussed.`,
        selectedDocs.map(doc => doc.name)
      );
      
      const videoSuggestionMessage: Message = {
        role: 'assistant',
        content: `📺 **Recommended Video Tutorials**\n\nBased on our conversation, here are some video tutorials that might help:\n\n${result.answer}\n\n💡 **Tip:** Visit the Video Tutorials page to watch these and more step-by-step repair guides!`,
      };
      
      setMessages(prev => [...prev, videoSuggestionMessage]);
      
      toast({
        title: "Video suggestions ready",
        description: "Check the chat for recommended tutorials",
      });
    } catch (error) {
      console.error('Error suggesting videos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Failed to suggest videos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export conversation as text file
  const handleExportConversation = () => {
    if (messages.length <= 1) {
      toast({
        title: "No conversation to export",
        description: "Start a conversation first to export",
        variant: "destructive",
      });
      return;
    }

    const conversationText = messages
      .map((msg, idx) => {
        const role = msg.role === 'user' ? 'YOU' : 'AI ASSISTANT';
        const sources = msg.sources ? `\nSources: ${msg.sources.join(', ')}` : '';
        return `[${role}]\n${msg.content}${sources}\n`;
      })
      .join('\n' + '='.repeat(80) + '\n\n');

    const blob = new Blob([
      `FIXORA - Vehicle Service AI Assistant\nConversation Export\nDate: ${new Date().toLocaleString()}\n\n${'='.repeat(80)}\n\n${conversationText}`
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixora-conversation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation exported",
      description: "Your conversation has been downloaded as a text file",
    });
  };

  // Start new conversation
  const handleNewConversation = async () => {
    if (messages.length <= 1) return;
    
    // Clear chat history from database if user is logged in
    if (currentUser) {
      try {
        const { success, error } = await clearChatHistory();
        if (success) {
          console.log('✅ Chat history cleared from database');
          toast({
            title: "Chat history cleared",
            description: "All messages deleted from database",
          });
        } else {
          console.error('⚠️ Failed to clear chat history:', error);
          toast({
            title: "Warning",
            description: "Failed to clear database history, but local chat cleared",
            variant: "destructive",
          });
        }
      } catch (clearError) {
        console.error('Error clearing history:', clearError);
      }
    }
    
    // Reset to welcome message
    const welcomeMsg: Message = {
      role: 'assistant',
      content: '👋 **Welcome to Fixora AI Assistant!**\n\n📚 **How it works:**\n1. **Upload PDFs** - Drag & drop your vehicle manuals, repair guides, or technical documents\n2. **Automatic Processing** - I\'ll extract text and create a searchable knowledge base\n3. **Ask Questions** - I\'ll search your documents and provide answers with page citations\n\n🎯 **Key Features:**\n- ✅ Answers ONLY from your uploaded documents (no external knowledge)\n- ✅ Source citations with page numbers for verification\n- ✅ Semantic search to find relevant information\n- ✅ Processes up to 10MB PDFs\n\nUpload your first document to get started! 🚀',
    };
    
    setMessages([welcomeMsg]);
    setInput("");
    
    if (!currentUser) {
      toast({
        title: "New conversation started",
        description: "Previous conversation cleared (login to save history)",
      });
    }
  };

  return (
    <section id="assistant" className="pt-20 pb-12 bg-background min-h-screen">
      {/* Loading State for Initial Component Load */}
      {isInitializing && (
        <div className="container mx-auto px-6 flex items-center justify-center min-h-[70vh]">
          <Card className="p-8 text-center max-w-md">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Initializing AI Assistant</h3>
            <p className="text-muted-foreground mb-4">
              Loading chat history...
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Chat History</span>
                {!isLoadingHistory ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Assistant Interface */}
      {!isInitializing && (
        <>
          <div className="container mx-auto px-6">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-4 mb-3">
                <h2 className="text-4xl md:text-5xl font-bold">AI Knowledge Assistant</h2>
                {!showInstructions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInstructions(true)}
                    className="flex items-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Show Guide
                  </Button>
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-2">Ask questions about repair procedures, error codes, or specifications</p>
              
              {/* Mode Indicator */}
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
                {aiMode === 'api' ? (
                  <>
                    <CloudCog className="w-4 h-4 text-primary" />
                    <span className="text-sm"><strong>RAG Mode:</strong> Using document retrieval</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 text-blue-500" />
                    <span className="text-sm"><strong>Local Model:</strong> Using pre-trained model</span>
                  </>
                )}
              </div>
            </div>

            <div className="max-w-7xl mx-auto">
              {/* User Status Indicator */}
              {!isLoadingHistory && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentUser ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">
                          Logged in as <strong>{currentUser.email}</strong>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • Chat history enabled ✅
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 text-yellow-500">⚠️</span>
                    <span className="text-sm">
                      Not logged in - Chat history will not be saved
                    </span>
                    <Link to="/login" className="text-xs text-primary hover:underline ml-2">
                      Login to save history
                    </Link>
                  </>
                )}
              </div>
              {currentUser && (
                <Link to="/profile">
                  <Button variant="outline" size="sm">
                    Manage Account
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Background document restoration notification */}
        {isRestoringDocuments && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Restoring your documents in the background...
              </span>
            </div>
          </div>
        )}

        {/* Welcome & Instructions Section */}
        {showInstructions && (
          <div className="max-w-7xl mx-auto mb-6">
            <Card className="p-6 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{aiMode === 'api' ? '🤖' : '🧠'}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {aiMode === 'api' 
                        ? 'Welcome to Fixora RAG-Based AI Assistant!' 
                        : 'Welcome to Fixora Local AI Model!'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {aiMode === 'api'
                        ? 'Upload your vehicle manuals and get instant, accurate answers'
                        : 'Ask questions directly - our pre-trained model is ready to help'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowInstructions(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {aiMode === 'api' ? (
                // RAG Mode Instructions
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-card/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🎯</span>
                        <h4 className="font-semibold">What is RAG?</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        RAG (Retrieval-Augmented Generation) means I answer questions ONLY from YOUR uploaded documents. No guessing!
                      </p>
                    </div>

                    <div className="bg-card/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📚</span>
                        <h4 className="font-semibold">How it works</h4>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>1. Upload Documents</div>
                        <div>2. Automatic Processing</div>
                        <div>3. Ask Questions</div>
                      </div>
                    </div>

                    <div className="bg-card/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">✅</span>
                        <h4 className="font-semibold">What I CAN do</h4>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Answer from YOUR docs</div>
                        <div>• Find specific procedures</div>
                        <div>• Cite exact sources</div>
                      </div>
                    </div>

                    <div className="bg-card/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">❌</span>
                        <h4 className="font-semibold">What I CANNOT do</h4>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• General knowledge</div>
                        <div>• External information</div>
                        <div>• Opinions/assumptions</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-primary">
                      🚀 <strong>Get Started:</strong> Upload your service manuals using the Knowledge Base section on the left, then ask your questions!
                    </p>
                  </div>
                </>
              ) : (
                // Local Model Instructions
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-card/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🧠</span>
                        <h4 className="font-semibold">Pre-trained Model</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Our model is trained on thousands of vehicle repair manuals and technical documentation.
                      </p>
                    </div>

                    <div className="bg-card/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⚡</span>
                        <h4 className="font-semibold">No Upload Needed</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Just ask your question directly - the model already has extensive automotive knowledge.
                      </p>
                    </div>

                    <div className="bg-card/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">✅</span>
                        <h4 className="font-semibold">What I CAN do</h4>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Answer repair questions</div>
                        <div>• Explain error codes</div>
                        <div>• General procedures</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      🚀 <strong>Get Started:</strong> Type your question below and press Send. No document upload required!
                    </p>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`grid grid-cols-1 ${aiMode === 'api' ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-4 sm:gap-6 h-auto lg:h-[500px]`}>
            {/* Left Sidebar - Documents (Only in RAG Mode) */}
            {aiMode === 'api' && (
              <Card className="lg:col-span-1 bg-card border-border p-4 sm:p-6 max-h-[400px] lg:max-h-none overflow-y-auto">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Knowledge Base</h3>
                    {isRestoringDocuments && (
                      <Badge variant="outline" className="text-xs">
                        <Database className="w-3 h-3 mr-1 animate-pulse" />
                        Restoring...
                      </Badge>
                    )}
                  </div>
                
                {/* Processing Info Banner */}
                {documents.some(d => d.status !== 'ready') && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                      ⏳ Processing Document...
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      • First upload: ~2-3 minutes (downloading AI model)<br/>
                      • Subsequent uploads: ~30-60 seconds<br/>
                      • Large files may take longer - please wait
                    </p>
                  </div>
                )}
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                
                {/* Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-primary bg-primary/10 scale-105' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isDragging ? 'Drop documents here' : 'Drag & Drop documents here'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      PDF, DOCX, DOC, TXT (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Documents ({documents.length})
                  </h4>
                  {documents.filter(d => d.status === 'ready').length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="h-7 text-xs"
                    >
                      {documents.filter(d => d.status === 'ready').every(d => d.selected) ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>
                
                {/* Selected documents info */}
                {documents.filter(d => d.status === 'ready' && d.selected).length > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-primary">
                      🎯 {documents.filter(d => d.status === 'ready' && d.selected).length} document(s) selected for AI guidance
                    </p>
                  </div>
                )}

                {documents.map((doc, index) => (
                  <div
                    key={`${doc.name}-${index}`}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all group ${
                      doc.selected && doc.status === 'ready'
                        ? 'bg-primary/5 border-2 border-primary/30'
                        : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
                    }`}
                  >
                    {/* Checkbox for selection (only for ready documents) */}
                    {doc.status === 'ready' && (
                      <div className="flex items-center pt-0.5">
                        <Checkbox
                          checked={doc.selected || false}
                          onCheckedChange={() => toggleDocumentSelection(doc.name)}
                          className="h-4 w-4"
                        />
                      </div>
                    )}

                    {/* Status Icon */}
                    {(doc.status === 'uploading' || doc.status === 'processing' || doc.status === 'parsing' || doc.status === 'embedding') ? (
                      <div className="flex flex-col items-center gap-1">
                        <Loader2 className="w-5 h-5 text-primary flex-shrink-0 animate-spin" />
                        {doc.processingProgress !== undefined && (
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${doc.processingProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    )}
                    
                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {doc.status === 'ready' && (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">Ready</span>
                            {doc.totalPages && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{doc.totalPages} pages</span>
                              </>
                            )}
                            {doc.chunksCount && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{doc.chunksCount} chunks</span>
                              </>
                            )}
                          </>
                        )}
                        {doc.status === 'uploading' && (
                          <span className="text-xs text-muted-foreground">📤 Uploading...</span>
                        )}
                        {doc.status === 'parsing' && (
                          <span className="text-xs text-muted-foreground">📄 Extracting text...</span>
                        )}
                        {doc.status === 'embedding' && (
                          <span className="text-xs text-muted-foreground">🧠 Generating embeddings... {doc.processingProgress}%</span>
                        )}
                        {doc.status === 'processing' && (
                          <span className="text-xs text-muted-foreground">⚙️ Processing...</span>
                        )}
                        {doc.size && doc.status === 'ready' && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{doc.size}</span>
                          </>
                        )}
                      </div>
                      {doc.uploadDate && (
                        <p className="text-xs text-muted-foreground mt-1">{doc.uploadDate}</p>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    {doc.status === 'ready' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument(doc.name);
                        }}
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
            )}

            {/* Right Chat Interface */}
            <Card className={`${aiMode === 'api' ? 'lg:col-span-3' : 'lg:col-span-1'} bg-card border-border flex flex-col overflow-hidden min-h-[500px] lg:min-h-0`}>
              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquarePlus className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Help!</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        Upload your vehicle service manuals on the left, then ask me anything about repairs, procedures, or specifications.
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                        <p className="font-medium mb-1">💡 Example questions:</p>
                        <p>"How do I replace the timing belt on a 2020 Honda Civic?"</p>
                        <p>"What are the torque specs for the cylinder head bolts?"</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-full sm:max-w-[85%] lg:max-w-[80%] rounded-lg p-3 sm:p-4 text-sm sm:text-base ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {/* Voice Output Button for Assistant Messages */}
                      {message.role === 'assistant' && speechSupported && (
                        <div className="flex justify-end mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSpeaking(message.content)}
                            className="h-7 px-2 text-xs hover:bg-primary/10"
                            title={isSpeaking ? "Stop speaking" : "Read aloud"}
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-4 h-4 mr-1" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-4 h-4 mr-1" />
                                Listen
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      <div className="prose prose-invert max-w-none">
                        {message.content.split('\n').map((line, i) => {
                          // Handle bold text
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <p key={i} className="font-bold text-lg mb-2 mt-4">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          // Handle numbered lists
                          if (/^\d+\./.test(line)) {
                            return (
                              <p key={i} className="ml-4 mb-1">
                                {line}
                              </p>
                            );
                          }
                          // Handle quotes
                          if (line.startsWith('>')) {
                            return (
                              <blockquote key={i} className="border-l-4 border-primary/50 pl-4 my-4 italic bg-background/50 p-3 rounded">
                                {line.substring(1).trim()}
                              </blockquote>
                            );
                          }
                          // Regular text
                          return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                        })}
                      </div>

                      {/* Sources */}
                      {message.sources && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-sm font-semibold mb-2">Sources:</p>
                          {message.sources.map((source, i) => (
                            <p key={i} className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                              📄 {source}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  ))
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-primary rounded-full loading-dot"></div>
                        <div className="w-2 h-2 bg-primary rounded-full loading-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-3 sm:p-6">
                {/* Selected documents indicator */}
                {getSelectedDocumentsInfo().length > 0 && (
                  <div className="mb-2 sm:mb-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-primary font-medium">
                      🤖 AI will reference {getSelectedDocumentsInfo().length} selected document(s)
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2 sm:gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Ask about repair..."
                    className="flex-1 bg-muted border-border focus:border-primary text-sm sm:text-base h-10 sm:h-11"
                  />
                  
                  {/* Voice Input Button */}
                  {speechSupported && (
                    <Button
                      onClick={startListening}
                      disabled={isLoading}
                      variant="outline"
                      className={`border-primary/50 hover:bg-primary/10 ${isListening ? 'bg-red-500/20 border-red-500' : ''}`}
                      title={isListening ? "Listening... Click to stop" : "Voice input"}
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5 text-red-500 animate-pulse" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={isLoading || messages.length <= 1}
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10"
                    title="Generate conversation summary"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions Section - Transition to Footer */}
        <div className="max-w-7xl mx-auto mt-12">
          <Card className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-primary/5 border-primary/20 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Need More Help?</h3>
              <p className="text-muted-foreground">Quick actions to enhance your experience</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* New Conversation */}
              <Button
                onClick={handleNewConversation}
                disabled={messages.length <= 1}
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <MessageSquarePlus className="w-6 h-6 text-primary" />
                <span className="font-semibold">New Chat</span>
                <span className="text-xs text-muted-foreground">Start fresh conversation</span>
              </Button>

              {/* Suggest Videos - NEW */}
              <Button
                onClick={handleSuggestVideos}
                disabled={messages.length <= 1 || isLoading}
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <Video className="w-6 h-6 text-primary" />
                <span className="font-semibold">Video Tutorials</span>
                <span className="text-xs text-muted-foreground">Get repair video tips</span>
              </Button>

              {/* Export Conversation */}
              <Button
                onClick={handleExportConversation}
                disabled={messages.length <= 1}
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <Download className="w-6 h-6 text-primary" />
                <span className="font-semibold">Export Chat</span>
                <span className="text-xs text-muted-foreground">Download conversation</span>
              </Button>

              {/* Help Center */}
              <Link to="/help-center">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <HelpCircle className="w-6 h-6 text-primary" />
                  <span className="font-semibold">Help Center</span>
                  <span className="text-xs text-muted-foreground">Get support & guides</span>
                </Button>
              </Link>

              {/* Contact Support */}
              <Link to="/contact-us">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <FileText className="w-6 h-6 text-primary" />
                  <span className="font-semibold">Contact Us</span>
                  <span className="text-xs text-muted-foreground">Reach our support team</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
        </>
      )}
    </section>
  );
};

export default Assistant;
