/**
 * Interactive Troubleshooting Decision Tree Component
 * Guides technicians through step-by-step diagnostic workflows
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

interface TroubleshootingStep {
  id: string;
  question: string;
  type: 'check' | 'action' | 'result';
  yesNext?: string;
  noNext?: string;
  solution?: string;
  warning?: string;
  tools?: string[];
}

interface TroubleshootingFlow {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: Record<string, TroubleshootingStep>;
  startStep: string;
}

const troubleshootingFlows: TroubleshootingFlow[] = [
  {
    id: 'engine-wont-start',
    title: 'Engine Won\'t Start',
    description: 'Diagnose why your engine fails to start',
    category: 'Engine',
    startStep: 'step1',
    steps: {
      step1: {
        id: 'step1',
        type: 'check',
        question: 'Does the engine crank when you turn the key?',
        yesNext: 'step2',
        noNext: 'step3',
      },
      step2: {
        id: 'step2',
        type: 'check',
        question: 'Do you hear the fuel pump prime when you turn the key to ON (not start)?',
        yesNext: 'step4',
        noNext: 'step5',
      },
      step3: {
        id: 'step3',
        type: 'check',
        question: 'Do the dashboard lights turn on when you turn the key?',
        yesNext: 'step6',
        noNext: 'battery-dead',
      },
      step4: {
        id: 'step4',
        type: 'check',
        question: 'Can you smell gasoline or see spark plugs wet with fuel?',
        yesNext: 'spark-issue',
        noNext: 'step5',
      },
      step5: {
        id: 'step5',
        type: 'result',
        question: 'Fuel System Issue Detected',
        solution: '**Likely Causes:**\n\n1. **Fuel Pump Failure** - No fuel being delivered\n2. **Clogged Fuel Filter** - Restricting fuel flow\n3. **Empty Tank** - Check fuel gauge\n4. **Fuel Pump Relay** - Check fuse box\n\n**Next Steps:**\n- Check fuel pump fuse and relay\n- Listen for fuel pump hum\n- Check fuel pressure with gauge (should be 40-60 PSI)\n- Replace fuel filter if old\n- Test fuel pump operation',
        tools: ['Fuel pressure gauge', 'Multimeter', 'Socket set'],
      },
      step6: {
        id: 'step6',
        type: 'result',
        question: 'Starter or Ignition Switch Issue',
        solution: '**Likely Causes:**\n\n1. **Bad Starter Motor** - Not engaging\n2. **Faulty Ignition Switch** - Not sending signal\n3. **Neutral Safety Switch** - (Automatic) Not detecting Park/Neutral\n4. **Clutch Switch** - (Manual) Not detecting clutch press\n\n**Next Steps:**\n- Test starter by bypassing ignition switch\n- Check neutral safety switch\n- Inspect wiring to starter\n- Tap starter with hammer while cranking (temporary test)\n- Replace starter if needed',
        tools: ['Multimeter', 'Socket set', 'Test light'],
      },
      'battery-dead': {
        id: 'battery-dead',
        type: 'result',
        question: 'Dead Battery Detected',
        solution: '**Likely Causes:**\n\n1. **Discharged Battery** - Low voltage\n2. **Corroded Battery Terminals** - Poor connection\n3. **Bad Battery** - Won\'t hold charge\n4. **Alternator Failure** - Not charging battery\n\n**Immediate Action:**\n- Jump start the vehicle\n- Clean battery terminals with wire brush\n- Check battery voltage (should be 12.6V when off)\n- Test alternator output (13.5-14.5V when running)\n\n**Next Steps:**\n- Load test battery at auto parts store\n- Replace if older than 3-5 years\n- Check for parasitic drain',
        warning: '⚠️ Always wear safety glasses when working with batteries',
        tools: ['Multimeter', 'Battery terminal cleaner', 'Jumper cables'],
      },
      'spark-issue': {
        id: 'spark-issue',
        type: 'result',
        question: 'Ignition System Issue',
        solution: '**Likely Causes:**\n\n1. **No Spark at Plugs** - Bad coil(s)\n2. **Worn Spark Plugs** - Not firing properly\n3. **Faulty Crankshaft Position Sensor** - No signal to ECU\n4. **Bad Ignition Module/Coil Pack**\n\n**Next Steps:**\n- Pull spark plug and test for spark\n- Check spark plug gap (usually 0.028-0.060")\n- Inspect spark plug wires for damage\n- Test ignition coils with multimeter\n- Scan for diagnostic codes (P0300-P0312)\n- Check timing belt/chain hasn\'t jumped',
        tools: ['Spark plug socket', 'Spark tester', 'Multimeter', 'OBD2 scanner'],
        warning: '⚠️ High voltage! Use insulated tools',
      },
    },
  },
  {
    id: 'overheating',
    title: 'Engine Overheating',
    description: 'Diagnose engine temperature issues',
    category: 'Cooling System',
    startStep: 'step1',
    steps: {
      step1: {
        id: 'step1',
        type: 'check',
        question: 'Is the coolant level low when engine is cold?',
        yesNext: 'coolant-low',
        noNext: 'step2',
      },
      step2: {
        id: 'step2',
        type: 'check',
        question: 'Is the radiator fan running when engine is hot?',
        yesNext: 'step3',
        noNext: 'fan-issue',
      },
      step3: {
        id: 'step3',
        type: 'check',
        question: 'Is there white smoke from exhaust or milky oil?',
        yesNext: 'head-gasket',
        noNext: 'step4',
      },
      step4: {
        id: 'step4',
        type: 'check',
        question: 'Does upper radiator hose stay cold while engine heats up?',
        yesNext: 'thermostat-stuck',
        noNext: 'water-pump',
      },
      'coolant-low': {
        id: 'coolant-low',
        type: 'result',
        question: 'Coolant Leak Detected',
        solution: '**Likely Causes:**\n\n1. **Radiator Leak** - Check for wet spots\n2. **Hose Leak** - Inspect all hoses\n3. **Water Pump Leak** - Look for leak at front of engine\n4. **Head Gasket** - Internal leak (see white smoke)\n\n**Next Steps:**\n- Perform pressure test on cooling system\n- Add UV dye to coolant to find leak\n- Check radiator cap for proper seal\n- Inspect heater core for leaks inside car\n- Fix leak before adding coolant',
        warning: '⚠️ NEVER open radiator cap when hot! Risk of severe burns',
        tools: ['Cooling system pressure tester', 'UV dye kit', 'Flashlight'],
      },
      'fan-issue': {
        id: 'fan-issue',
        type: 'result',
        question: 'Cooling Fan Problem',
        solution: '**Likely Causes:**\n\n1. **Bad Fan Relay** - Not triggering fan\n2. **Faulty Temperature Sensor** - Not signaling ECU\n3. **Blown Fuse** - Check fuse box\n4. **Bad Fan Motor** - Motor seized or burned out\n\n**Next Steps:**\n- Check fan fuse and relay\n- Test fan by connecting directly to battery\n- Test temperature sensor resistance\n- Check ECU for fan control output\n- Replace faulty component',
        tools: ['Multimeter', 'Test light', 'Jumper wires'],
      },
      'head-gasket': {
        id: 'head-gasket',
        type: 'result',
        question: 'Possible Head Gasket Failure',
        solution: '**Symptoms Confirm:**\n\n1. **White Smoke** - Coolant burning in cylinders\n2. **Milky Oil** - Coolant mixing with oil\n3. **Bubbles in Radiator** - Combustion gases in coolant\n4. **Loss of Power** - Compression leak\n\n**Diagnosis:**\n- Perform compression test\n- Use combustion leak tester (chemical test)\n- Inspect spark plugs for steam cleaning\n- Check for coolant in oil\n\n**Repair:**\n⚠️ **MAJOR REPAIR NEEDED**\n- Head gasket replacement required\n- May need cylinder head resurfacing\n- Cost: $1000-$3000 depending on vehicle\n- 8-12 hours labor',
        warning: '⚠️ DO NOT DRIVE! Risk of catastrophic engine damage',
        tools: ['Compression tester', 'Block tester kit', 'Torque wrench'],
      },
      'thermostat-stuck': {
        id: 'thermostat-stuck',
        type: 'result',
        question: 'Thermostat Stuck Closed',
        solution: '**Symptoms:**\n\n1. Upper radiator hose stays cold\n2. Heater may not work well\n3. Engine overheats quickly\n4. Temperature gauge rises rapidly\n\n**Solution:**\n- Replace thermostat ($15-$50 part)\n- Replace coolant while system is drained\n- Burp cooling system after refill\n- Test heater operation\n\n**Prevention:**\n- Replace every 50,000-100,000 miles\n- Use correct temperature rating\n- Always use proper coolant mix (50/50)',
        tools: ['Socket set', 'Scraper', 'Drain pan', 'New coolant'],
      },
      'water-pump': {
        id: 'water-pump',
        type: 'result',
        question: 'Water Pump Failure',
        solution: '**Symptoms:**\n\n1. Coolant leak from front of engine\n2. Grinding noise from water pump\n3. Loose/wobbling pulley\n4. Engine overheats\n\n**Diagnosis:**\n- Inspect for leaks at pump weep hole\n- Check for play in pump shaft\n- Look for coolant on ground under engine\n- Listen for bearing noise\n\n**Repair:**\n- Replace water pump\n- Often done with timing belt service\n- Replace coolant\n- Cost: $200-$750 depending on access\n\n**Note:** If timing belt is due, do both together to save labor!',
        tools: ['Socket set', 'Torque wrench', 'Coolant', 'New gasket'],
      },
    },
  },
];

export default function TroubleshootingFlow({ flowId }: { flowId: string }) {
  const flow = troubleshootingFlows.find(f => f.id === flowId);
  const [currentStepId, setCurrentStepId] = useState(flow?.startStep || '');
  const [history, setHistory] = useState<string[]>([]);

  if (!flow) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Troubleshooting flow not found</AlertDescription>
      </Alert>
    );
  }

  const currentStep = flow.steps[currentStepId];

  const handleAnswer = (answer: 'yes' | 'no') => {
    setHistory([...history, currentStepId]);
    const nextStepId = answer === 'yes' ? currentStep.yesNext : currentStep.noNext;
    if (nextStepId) {
      setCurrentStepId(nextStepId);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1];
      setCurrentStepId(previousStep);
      setHistory(history.slice(0, -1));
    }
  };

  const handleReset = () => {
    setCurrentStepId(flow.startStep);
    setHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-blue-500/10">
        <h2 className="text-2xl font-bold mb-2">{flow.title}</h2>
        <p className="text-muted-foreground">{flow.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
            {flow.category}
          </span>
          <span className="text-xs text-muted-foreground">
            Step {history.length + 1} of {Object.keys(flow.steps).length}
          </span>
        </div>
      </Card>

      {/* Current Step */}
      <Card className="p-8">
        {currentStep.type === 'check' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{currentStep.question}</h3>
                {currentStep.warning && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{currentStep.warning}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={() => handleAnswer('yes')}
                className="flex-1 h-16 text-lg"
                variant="default"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Yes
              </Button>
              <Button
                onClick={() => handleAnswer('no')}
                className="flex-1 h-16 text-lg"
                variant="outline"
              >
                <XCircle className="w-5 h-5 mr-2" />
                No
              </Button>
            </div>
          </div>
        )}

        {currentStep.type === 'result' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">{currentStep.question}</h3>
                
                {currentStep.warning && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription className="font-semibold">{currentStep.warning}</AlertDescription>
                  </Alert>
                )}

                <div className="prose prose-sm max-w-none">
                  {currentStep.solution?.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h4 key={i} className="font-bold text-lg mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                    }
                    if (line.startsWith('###')) {
                      return <h4 key={i} className="font-semibold text-base mt-3 mb-2">{line.replace(/###/g, '')}</h4>;
                    }
                    if (line.match(/^\d+\./)) {
                      return <li key={i} className="ml-4 mb-1">{line}</li>;
                    }
                    if (line.startsWith('-')) {
                      return <li key={i} className="ml-4 mb-1">{line.substring(1)}</li>;
                    }
                    return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                  })}
                </div>

                {currentStep.tools && currentStep.tools.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                    <h4 className="font-semibold mb-2">🔧 Required Tools:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentStep.tools.map((tool, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{tool}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleReset}
              className="w-full h-12 text-lg"
              variant="default"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Start Over
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            onClick={handleBack}
            disabled={history.length === 0}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleReset} variant="ghost">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </Card>
    </div>
  );
}

export { troubleshootingFlows };
export type { TroubleshootingFlow };
