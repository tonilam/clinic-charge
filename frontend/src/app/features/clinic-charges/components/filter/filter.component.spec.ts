import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { FilterComponent } from './filter.component';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filterApplied with current values on Apply', () => {
    const emitSpy = vi.spyOn(component.filterApplied, 'emit');
    component.chargeType = 'Consultation';
    component.medicalCentreName = 'City';
    component.onApply();
    expect(emitSpy).toHaveBeenCalledWith({
      chargeType: 'Consultation',
      medicalCentreName: 'City',
    });
  });

  it('should clear values and emit filterCleared on Clear', () => {
    const emitSpy = vi.spyOn(component.filterCleared, 'emit');
    component.chargeType = 'Emergency';
    component.medicalCentreName = 'North';
    component.onClear();
    expect(component.chargeType).toBe('');
    expect(component.medicalCentreName).toBe('');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit with empty values when nothing is selected', () => {
    const emitSpy = vi.spyOn(component.filterApplied, 'emit');
    component.onApply();
    expect(emitSpy).toHaveBeenCalledWith({
      chargeType: '',
      medicalCentreName: '',
    });
  });

  it('should have populated chargeTypes list', () => {
    expect(component.chargeTypes.length).toBeGreaterThan(0);
    expect(component.chargeTypes).toContain('Consultation');
  });
});
