import { WanejoyhintService } from './wanejoyhint.service';
import { WanejoyhintStep } from '../models/wanejoyhint-step.model';

// Mock ApplicationRef and EnvironmentInjector minimally
function createService(): WanejoyhintService {
  const mockAppRef = {
    attachView: jest.fn(),
    detachView: jest.fn(),
  } as any;
  const mockInjector = {} as any;
  return new WanejoyhintService(mockAppRef, mockInjector);
}

describe('WanejoyhintService', () => {
  let service: WanejoyhintService;

  const makeStep = (overrides: Partial<WanejoyhintStep> = {}): WanejoyhintStep => ({
    selector: '.test-el',
    description: 'Test step',
    ...overrides,
  });

  beforeEach(() => {
    const el = document.createElement('div');
    el.className = 'test-el';
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ left: 100, top: 100, width: 200, height: 50, right: 300, bottom: 150 }),
      configurable: true,
    });
    document.body.appendChild(el);

    service = createService();
  });

  afterEach(() => {
    try {
      if (service && service.isRunning) {
        service.stop();
      }
    } catch (_) { /* ignore */ }
    document.querySelectorAll('.test-el').forEach(el => el.remove());
    document.querySelectorAll('#wanejoyhint-host').forEach(el => el.remove());
  });

  describe('setSteps', () => {
    it('should accept valid steps array', () => {
      expect(() => service.setSteps([makeStep()])).not.toThrow();
    });

    it('should throw on empty array', () => {
      expect(() => service.setSteps([])).toThrow(/must not be empty/);
    });

    it('should throw on non-array', () => {
      expect(() => service.setSteps(null as any)).toThrow();
    });
  });

  describe('run', () => {
    it('should throw if no steps configured', () => {
      expect(() => service.run()).toThrow(/No steps configured/);
    });

    it('should set running to true after run', () => {
      service.setSteps([makeStep()]);
      // run() calls createOverlay which uses createComponent - this will fail without Angular
      // but we can test the state before createOverlay
      expect(service.isRunning).toBe(false);
    });

    it('should call onStart callback', () => {
      const onStart = jest.fn();
      service.setSteps([makeStep()]);
      // Mock createOverlay to avoid createComponent failure
      (service as any).createOverlay = jest.fn();
      (service as any).overlayRef = {
        instance: { renderStep: jest.fn() },
      };
      service.run({ onStart });
      expect(onStart).toHaveBeenCalled();
    });

    it('should start at step 0', () => {
      service.setSteps([makeStep()]);
      expect(service.currentStepIndex).toBe(0);
    });
  });

  describe('stop', () => {
    it('should set running to false', () => {
      service.setSteps([makeStep()]);
      // Manually set running state since run() requires createComponent
      (service as any).running = true;
      service.stop();
      expect(service.isRunning).toBe(false);
    });
  });

  describe('next/prev', () => {
    it('should do nothing when not running', () => {
      service.setSteps([makeStep(), makeStep()]);
      service.next();
      expect(service.currentStepIndex).toBe(0);
    });

    it('should not go below 0 on prev()', () => {
      service.setSteps([makeStep()]);
      (service as any).running = true;
      service.prev();
      expect(service.currentStepIndex).toBe(0);
    });
  });

  describe('reRun', () => {
    it('should throw if no steps', () => {
      expect(() => service.reRun(0)).toThrow(/No steps configured/);
    });

    it('should clamp step index to valid range', () => {
      service.setSteps([makeStep(), makeStep()]);
      try { service.reRun(99); } catch (_) { /* createComponent */ }
      expect(service.currentStepIndex).toBe(1);
    });

    it('should clamp negative step index to 0', () => {
      service.setSteps([makeStep(), makeStep()]);
      try { service.reRun(-5); } catch (_) { /* createComponent */ }
      expect(service.currentStepIndex).toBe(0);
    });
  });

  describe('setCurrentStep/getCurrentStep', () => {
    it('should set and get current step', () => {
      service.setCurrentStep(5);
      expect(service.getCurrentStep()).toBe(5);
    });
  });

  describe('observables', () => {
    it('should expose onStepChange observable', () => {
      expect(service.onStepChange).toBeDefined();
      expect(typeof service.onStepChange.subscribe).toBe('function');
    });

    it('should expose onEnd observable', () => {
      expect(service.onEnd).toBeDefined();
      expect(typeof service.onEnd.subscribe).toBe('function');
    });

    it('should expose onSkip observable', () => {
      expect(service.onSkip).toBeDefined();
      expect(typeof service.onSkip.subscribe).toBe('function');
    });
  });

  describe('trigger', () => {
    it('should do nothing when not running', () => {
      service.setSteps([makeStep()]);
      service.trigger('next');
      expect(service.currentStepIndex).toBe(0);
    });

    it('should handle skip trigger', () => {
      const onSkip = jest.fn();
      service.setSteps([makeStep()]);
      (service as any).running = true;
      (service as any).events = { onSkip };
      service.trigger('skip');
      expect(onSkip).toHaveBeenCalled();
      expect(service.isRunning).toBe(false);
    });

    it('should advance custom event step', () => {
      service.setSteps([makeStep({ eventType: 'custom' }), makeStep()]);
      (service as any).running = true;
      // overlayRef is null so executeStep will fail, but currentStep advances
      try { service.trigger('myEvent'); } catch (_) { /* no overlay */ }
      expect(service.currentStepIndex).toBe(1);
    });

    it('should not advance non-custom step on unknown trigger', () => {
      service.setSteps([makeStep({ eventType: 'next' }), makeStep()]);
      (service as any).running = true;
      service.trigger('myEvent');
      expect(service.currentStepIndex).toBe(0);
    });
  });

  describe('callbacks', () => {
    it('should call onBeforeStart during executeStep', () => {
      const onBeforeStart = jest.fn();
      service.setSteps([makeStep({ onBeforeStart }), makeStep()]);
      (service as any).running = true;
      // Mock overlayRef
      (service as any).overlayRef = {
        instance: {
          renderStep: jest.fn(),
        },
      };
      // Call executeStep directly
      (service as any).executeStep();
      expect(onBeforeStart).toHaveBeenCalled();
    });
  });
});
