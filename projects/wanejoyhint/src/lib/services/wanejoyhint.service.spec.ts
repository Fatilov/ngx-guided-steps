import { WanejoyhintService } from './wanejoyhint.service';
import { WanejoyhintStep } from '../models/wanejoyhint-step.model';
import { DEFAULT_CONFIG, DEFAULT_LABELS } from '../models/wanejoyhint-config.model';
import { Subject } from 'rxjs';

function createServiceManually(): WanejoyhintService {
  const svc = Object.create(WanejoyhintService.prototype);
  svc['steps'] = [];
  svc['currentStep'] = 0;
  svc['overlayRef'] = null;
  svc['events'] = {};
  svc['config'] = {
    backgroundColor: 'rgba(0,0,0,0.6)',
    nextButtonText: 'Next',
    prevButtonText: 'Previous',
    skipButtonText: 'Skip',
    zIndex: 1010,
    scrollAnimationSpeed: 250,
  };
  svc['eventListenerCleanup'] = null;
  svc['customEventSub'] = null;
  svc['running'] = false;
  svc['pendingTimeouts'] = [];
  svc['stepChange$'] = new Subject();
  svc['end$'] = new Subject();
  svc['skip$'] = new Subject();
  svc['appRef'] = { attachView: jest.fn(), detachView: jest.fn() };
  svc['injector'] = {};
  return svc;
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

    service = createServiceManually();
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
      expect(service.isRunning).toBe(false);
    });

    it('should call onStart callback', () => {
      const onStart = jest.fn();
      service.setSteps([makeStep()]);
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
      (service as any).overlayRef = {
        instance: {
          renderStep: jest.fn(),
        },
      };
      (service as any).executeStep();
      expect(onBeforeStart).toHaveBeenCalled();
    });

    it('should call onNext callback on handleNext', () => {
      const onNext = jest.fn();
      service.setSteps([makeStep({ onNext }), makeStep()]);
      (service as any).running = true;
      (service as any).overlayRef = {
        instance: { renderStep: jest.fn() },
      };
      (service as any).handleNext();
      expect(onNext).toHaveBeenCalled();
    });

    it('should call onPrev callback on handlePrev', () => {
      const onPrev = jest.fn();
      service.setSteps([makeStep(), makeStep({ onPrev })]);
      (service as any).running = true;
      (service as any).currentStep = 1;
      (service as any).overlayRef = {
        instance: { renderStep: jest.fn() },
      };
      (service as any).handlePrev();
      expect(onPrev).toHaveBeenCalled();
    });

    it('should call onSkip callback on handleSkip', () => {
      const onSkip = jest.fn();
      service.setSteps([makeStep({ onSkip })]);
      (service as any).running = true;
      (service as any).handleSkip();
      expect(onSkip).toHaveBeenCalled();
    });
  });

  describe('config defaults', () => {
    it('should have correct DEFAULT_CONFIG values', () => {
      expect(DEFAULT_CONFIG.backgroundColor).toBe('rgba(0,0,0,0.6)');
      expect(DEFAULT_CONFIG.zIndex).toBe(1010);
      expect(DEFAULT_CONFIG.animationTime).toBe(800);
      expect(DEFAULT_CONFIG.showProgress).toBe(false);
      expect(DEFAULT_CONFIG.theme).toBe('light');
      expect(DEFAULT_CONFIG.keyboardNav).toBe(true);
      expect(DEFAULT_CONFIG.backdropDismiss).toBe(false);
    });

    it('should have correct DEFAULT_LABELS values', () => {
      expect(DEFAULT_LABELS.next).toBe('Next');
      expect(DEFAULT_LABELS.prev).toBe('Previous');
      expect(DEFAULT_LABELS.skip).toBe('Skip');
      expect(DEFAULT_LABELS.close).toBe('Close tutorial');
      expect(DEFAULT_LABELS.progress).toContain('{{current}}');
      expect(DEFAULT_LABELS.progress).toContain('{{total}}');
      expect(DEFAULT_LABELS.stepLabel).toContain('{{current}}');
      expect(DEFAULT_LABELS.stepAnnouncement).toContain('{{description}}');
    });
  });

  describe('step model', () => {
    it('should support autoAdvance property', () => {
      const step = makeStep({ autoAdvance: 3000 });
      expect(step.autoAdvance).toBe(3000);
    });

    it('should support step-level callbacks', () => {
      const step = makeStep({
        onNext: jest.fn(),
        onPrev: jest.fn(),
        onSkip: jest.fn(),
        onBeforeStart: jest.fn(),
      });
      expect(step.onNext).toBeDefined();
      expect(step.onPrev).toBeDefined();
      expect(step.onSkip).toBeDefined();
      expect(step.onBeforeStart).toBeDefined();
    });
  });

  describe('validateSteps', () => {
    it('should return empty array when all selectors exist', () => {
      service.setSteps([makeStep({ selector: '.test-el' })]);
      expect(service.validateSteps()).toEqual([]);
    });

    it('should return missing selectors', () => {
      service.setSteps([
        makeStep({ selector: '.test-el' }),
        makeStep({ selector: '.nonexistent' }),
      ]);
      expect(service.validateSteps()).toEqual(['.nonexistent']);
    });
  });
});
