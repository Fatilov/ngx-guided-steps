import { PositionService, ArrowData } from './position.service';
import { ResolvedStepData } from '../models/step.model';

describe('PositionService', () => {
  let service: PositionService;

  beforeEach(() => {
    service = new PositionService();
  });

  describe('resolveElementPosition', () => {
    it('should return null for a non-existent selector', () => {
      const result = service.resolveElementPosition('.non-existent');
      expect(result).toBeNull();
    });

    it('should return element position with default margin', () => {
      const el = document.createElement('div');
      el.id = 'test-el';
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () => ({ left: 100, top: 50, width: 200, height: 100, right: 300, bottom: 150 }),
      });
      document.body.appendChild(el);

      const result = service.resolveElementPosition('#test-el');
      expect(result).not.toBeNull();
      expect(result!.centerX).toBe(200); // 100 + 200/2
      expect(result!.centerY).toBe(100); // 50 + 100/2
      expect(result!.width).toBe(210);   // 200 + 10 margin
      expect(result!.height).toBe(110);  // 100 + 10 margin

      document.body.removeChild(el);
    });

    it('should apply custom margin', () => {
      const el = document.createElement('div');
      el.id = 'test-margin';
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, width: 100, height: 50, right: 100, bottom: 50 }),
      });
      document.body.appendChild(el);

      const result = service.resolveElementPosition('#test-margin', 20);
      expect(result!.width).toBe(120);
      expect(result!.height).toBe(70);

      document.body.removeChild(el);
    });
  });

  describe('calculateLabelPosition', () => {
    const makeData = (overrides: Partial<ResolvedStepData> = {}): ResolvedStepData => ({
      step: { selector: '.test', description: 'test' },
      centerX: 500,
      centerY: 300,
      width: 100,
      height: 50,
      radius: 0,
      shape: 'rect',
      ...overrides,
    });

    beforeEach(() => {
      // Mock viewport
      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });
    });

    it('should return label and arrow positions', () => {
      const data = makeData();
      const result = service.calculateLabelPosition(data, 200, 50);
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('arrow');
      expect(result.label).toHaveProperty('x');
      expect(result.label).toHaveProperty('y');
    });

    it('should return oversized arrow when no zone fits', () => {
      // Element fills the whole viewport
      const data = makeData({ centerX: 50, centerY: 50, width: 100, height: 100 });
      Object.defineProperty(window, 'innerWidth', { value: 120, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 120, configurable: true });

      const result = service.calculateLabelPosition(data, 200, 200);
      // oversized: arrow is all zeros
      expect(result.arrow.xFrom).toBe(0);
      expect(result.arrow.yFrom).toBe(0);
      expect(result.arrow.xTo).toBe(0);
      expect(result.arrow.yTo).toBe(0);
    });

    it('should prefer center_bottom for element near top', () => {
      const data = makeData({ centerX: 960, centerY: 50 });
      const result = service.calculateLabelPosition(data, 200, 50);
      // Label should be below center
      expect(result.label.y).toBeGreaterThan(50);
    });

    it('should clamp label to viewport bounds', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
      const data = makeData({ centerX: 380 });
      const result = service.calculateLabelPosition(data, 200, 50);
      // Label x should be clamped so it doesn't go off screen
      expect(result.label.x + 200).toBeLessThanOrEqual(400);
    });

    it('should handle circle shape', () => {
      const data = makeData({ shape: 'circle', radius: 50 });
      const result = service.calculateLabelPosition(data, 200, 50);
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('arrow');
    });

    it('should handle mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });

      const data = makeData({ centerX: 187, centerY: 300 });
      const result = service.calculateLabelPosition(data, 300, 50);
      // Label should be clamped within mobile viewport
      expect(result.label.x).toBeGreaterThanOrEqual(0);
      expect(result.label.x + 300).toBeLessThanOrEqual(375);
    });
  });

  describe('calculateButtonPositions', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });
    });

    it('should return prev, next, and skip positions', () => {
      const result = service.calculateButtonPositions(
        100, 200, 300, 50,  // label x, y, w, h
        500, 250, 250, 300, // xTo, xFrom, yFrom, yTo
        100, 80, 60,        // nextW, prevW, skipW
        true, true           // showPrev, showNext
      );
      expect(result).toHaveProperty('prev');
      expect(result).toHaveProperty('next');
      expect(result).toHaveProperty('skip');
    });

    it('should stack buttons vertically when they dont fit in a row', () => {
      Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 568, configurable: true });

      const result = service.calculateButtonPositions(
        10, 200, 300, 50,
        200, 160, 250, 300,
        150, 120, 100,
        true, true
      );
      // When stacked, buttons should have different y positions
      expect(result.next.y).not.toBe(result.prev.y);
    });

    it('should handle showPrev=false', () => {
      const result = service.calculateButtonPositions(
        100, 200, 300, 50,
        500, 250, 250, 300,
        100, 0, 60,
        false, true
      );
      expect(result.next.x).toBeLessThanOrEqual(result.skip.x);
    });

    it('should clamp button positions to viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });

      const result = service.calculateButtonPositions(
        350, 200, 100, 50,
        500, 400, 250, 300,
        100, 80, 60,
        true, true
      );
      expect(result.prev.x).toBeGreaterThanOrEqual(10);
      expect(result.next.x).toBeGreaterThanOrEqual(10);
      expect(result.skip.x).toBeGreaterThanOrEqual(10);
    });
  });

  describe('isElementInViewport', () => {
    it('should return false for non-existent element', () => {
      expect(service.isElementInViewport('.nope')).toBe(false);
    });

    it('should return true for element in viewport', () => {
      Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });
      const el = document.createElement('div');
      el.id = 'vp-test';
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () => ({ top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100 }),
      });
      document.body.appendChild(el);

      expect(service.isElementInViewport('#vp-test')).toBe(true);
      document.body.removeChild(el);
    });
  });

  describe('generateArrowPath', () => {
    it('should generate horizontal arrow path', () => {
      const arrow: ArrowData = { xFrom: 100, yFrom: 200, xTo: 300, yTo: 400, orientation: 'hor' };
      const path = service.generateArrowPath(arrow);
      expect(path).toBe('M100,200 Q300,200 300,400');
    });

    it('should generate vertical arrow path', () => {
      const arrow: ArrowData = { xFrom: 100, yFrom: 200, xTo: 300, yTo: 400, orientation: 'ver' };
      const path = service.generateArrowPath(arrow);
      expect(path).toBe('M100,200 Q100,400 300,400');
    });
  });
});
