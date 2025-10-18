// Chat History Storage with Supabase
import { supabase, getCurrentUser } from './supabase';

export interface StoredMessage {
  id?: string;
  user_id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  created_at?: string;
}

export interface StoredDocument {
  id?: string;
  user_id?: string;
  name: string;
  file_path?: string;
  page_count?: number;
  chunks_count?: number;
  upload_date?: string;
  created_at?: string;
}

/**
 * Save a chat message to the database
 */
export const saveChatMessage = async (
  message: StoredMessage
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user logged in - message not saved to database');
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: message.role,
        content: message.content,
        sources: message.sources || null,
      });

    if (error) {
      console.error('Error saving message:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception saving message:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Load chat history for the current user
 */
export const loadChatHistory = async (): Promise<{
  messages: StoredMessage[];
  error?: string;
}> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user logged in - no chat history to load');
      return { messages: [] };
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading chat history:', error);
      return { messages: [], error: error.message };
    }

    return { messages: data || [] };
  } catch (error) {
    console.error('Exception loading chat history:', error);
    return { messages: [], error: String(error) };
  }
};

/**
 * Clear all chat history for the current user
 */
export const clearChatHistory = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing chat history:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception clearing chat history:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Save document metadata to the database
 */
export const saveDocument = async (
  document: StoredDocument
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user logged in - document not saved to database');
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: document.name,
        file_path: document.file_path,
        page_count: document.page_count,
        chunks_count: document.chunks_count,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving document:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Exception saving document:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Load document metadata for the current user
 */
export const loadUserDocuments = async (): Promise<{
  documents: StoredDocument[];
  error?: string;
}> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user logged in - no documents to load');
      return { documents: [] };
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading documents:', error);
      return { documents: [], error: error.message };
    }

    return { documents: data || [] };
  } catch (error) {
    console.error('Exception loading documents:', error);
    return { documents: [], error: String(error) };
  }
};

/**
 * Delete a document from the database
 */
export const deleteDocument = async (
  documentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception deleting document:', error);
    return { success: false, error: String(error) };
  }
};
