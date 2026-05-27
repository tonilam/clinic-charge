# Frontend Testing with Vitest

## Overview

This document covers testing strategy for the clinic-charge frontend, using **Vitest** as the primary testing framework. Vitest provides fast, modern unit testing optimized for TypeScript and Angular applications.

---

## Why Vitest?

### 1. **Superior Performance**
- **10-100x faster** than Jasmine/Karma (Angular's default)
- Parallel test execution reduces feedback loop during development
- Instant HMR (Hot Module Reloading) for test files
- Smart and instant watch mode

### 2. **Modern Tooling**
- Built on **Vite** (lightning-fast ES modules bundler)
- Native ESM support without compilation overhead
- Better sourcemaps and debugging experience
- TypeScript support out-of-the-box

### 3. **Better Developer Experience**
- Jest-compatible API (familiar if coming from Jest)
- Excellent error messages and stack traces
- Built-in code coverage reporting
- Works seamlessly with TypeScript without extra configuration

### 4. **Easier Integration with Angular 20**
- Angular CLI v20+ has improved Vitest support
- Compatible with modern Angular standalone components
- Works well with dependency injection testing
- Native support for async/await and RxJS observables

### 5. **Lower Maintenance Overhead**
- No need for Karma (separate test runner)
- Fewer dependencies to manage
- Active community, well-maintained
- Industry adoption growing rapidly (companies like Nuxt, Astro use it)

---

## Setup & Configuration

### Prerequisites
- Node.js 24.x (already installed)
- npm 10.x+ (already available)
- Existing Angular 20 project

### Installation Steps

1. **Install Vitest and related packages**
   ```bash
   npm install -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/angular @testing-library/dom happy-dom
   ```

   **Dependencies breakdown:**
   - `vitest`: Core test runner
   - `@vitest/ui`: Visual test dashboard (optional but useful)
   - `@vitest/coverage-v8`: Code coverage reporting
   - `@testing-library/angular`: Testing utilities for Angular components
   - `@testing-library/dom`: DOM query helpers
   - `happy-dom`: Lightweight DOM implementation (faster than jsdom)

2. **Create `vitest.config.ts` in project root**
   ```typescript
   import { defineConfig } from 'vitest/config';
   import angular from '@analogjs/vite-plugin-angular';
   import path from 'path';

   export default defineConfig({
     plugins: [angular()],
     test: {
       globals: true,
       environment: 'happy-dom',
       setupFiles: ['src/test.ts'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html', 'lcov'],
         exclude: [
           'node_modules/',
           'src/test.ts',
           '**/*.spec.ts',
         ],
       },
       include: ['src/**/*.spec.ts'],
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

3. **Create `src/test.ts` (setup file)**
   ```typescript
   import { getTestBed } from '@angular/core/testing';
   import {
     BrowserDynamicTestingModule,
     platformBrowserDynamicTesting,
   } from '@angular/platform-browser-dynamic/testing';

   // First, initialize the Angular testing environment.
   getTestBed().initTestEnvironment(
     BrowserDynamicTestingModule,
     platformBrowserDynamicTesting()
   );
   ```

4. **Update `package.json` scripts**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest --coverage",
       "test:run": "vitest run"
     }
   }
   ```

---

## Testing Patterns for Your Stack

### 1. Testing Services (API Service & Clinic Charge Service)

```typescript
// api.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ClinicCharge, GridResponse } from '../models';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch paginated clinic charges', () => {
    const mockResponse: GridResponse = {
      data: [
        { id: 1, medical_centre_name: 'Clinic A', patient_visit_type: 'Consultation', charge_type: 'Doctor', amount: 100 },
      ],
      totalRows: 50,
    };

    service.getClinicCharges(0, 10, {}).subscribe((response) => {
      expect(response.data.length).toBe(1);
      expect(response.totalRows).toBe(50);
    });

    const req = httpMock.expectOne('/api/charges?startRow=0&endRow=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should apply filters in API request', () => {
    service.getClinicCharges(0, 10, { chargeType: 'Doctor' }).subscribe();
    
    const req = httpMock.expectOne((request) => 
      request.url.includes('/api/charges') && request.params.has('chargeType')
    );
    expect(req.request.params.get('chargeType')).toBe('Doctor');
    req.flush({ data: [], totalRows: 0 });
  });
});
```

### 2. Testing Components (Grid & Filter)

```typescript
// grid.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridComponent } from './grid.component';
import { ClinicChargeService } from '../../services/clinic-charge.service';
import { of } from 'rxjs';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  let chargeService: jasmine.SpyObj<ClinicChargeService>;

  beforeEach(async () => {
    const chargeServiceSpy = jasmine.createSpyObj('ClinicChargeService', [
      'getCharges',
      'updateCharge',
      'refreshGrid',
    ]);

    await TestBed.configureTestingModule({
      declarations: [GridComponent],
      providers: [
        { provide: ClinicChargeService, useValue: chargeServiceSpy },
      ],
    }).compileComponents();

    chargeService = TestBed.inject(ClinicChargeService) as jasmine.SpyObj<ClinicChargeService>;
    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
  });

  it('should display AG Grid with clinic charges', () => {
    const mockCharges = [
      { id: 1, medical_centre_name: 'Clinic A', charge_type: 'Doctor', amount: 100 },
    ];
    chargeService.getCharges.and.returnValue(of({ data: mockCharges, totalRows: 1 }));

    fixture.detectChanges();

    expect(component.rowData).toEqual(mockCharges);
  });

  it('should handle inline cell editing with PATCH request', () => {
    chargeService.updateCharge.and.returnValue(of({}));
    
    component.onCellValueChanged({
      data: { id: 1, amount: 150 },
      colDef: { field: 'amount' },
    });

    expect(chargeService.updateCharge).toHaveBeenCalledWith(1, { amount: 150 });
  });

  it('should revert cell value on update failure', () => {
    chargeService.updateCharge.and.returnValue(
      throwError(() => new Error('Update failed'))
    );
    
    const originalValue = component.rowData[0].amount;
    component.onCellValueChanged({ /* event */ });

    expect(component.rowData[0].amount).toBe(originalValue);
  });
});
```

### 3. Testing Standalone Components

```typescript
// filter.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterComponent } from './filter.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('FilterComponent (Standalone)', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;
  let compiled: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterComponent], // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
  });

  it('should emit filter values when Apply is clicked', () => {
    spyOn(component.filterApplied, 'emit');
    
    component.chargeType = 'Doctor';
    component.medicalCentre = 'Clinic A';
    
    const applyButton = compiled.query(By.css('button[type="submit"]'));
    applyButton.nativeElement.click();

    expect(component.filterApplied.emit).toHaveBeenCalledWith({
      chargeType: 'Doctor',
      medicalCentre: 'Clinic A',
    });
  });

  it('should clear filters on Clear button click', () => {
    spyOn(component.filterCleared, 'emit');
    
    component.chargeType = 'Doctor';
    
    const clearButton = compiled.query(By.css('button.clear'));
    clearButton.nativeElement.click();

    expect(component.chargeType).toBe('');
    expect(component.filterCleared.emit).toHaveBeenCalled();
  });
});
```

---

## Running Tests

### Development (Watch Mode)
```bash
npm test
```
- Runs tests in watch mode
- Re-runs on file changes
- Instant feedback

### With UI Dashboard
```bash
npm run test:ui
```
- Opens visual dashboard at `http://localhost:51204`
- See test status, logs, and source code
- Filter and debug tests interactively

### Coverage Report
```bash
npm run test:coverage
```
- Generates coverage reports in `coverage/` directory
- Open `coverage/index.html` in browser
- View line, branch, and statement coverage

### CI/CD Pipeline
```bash
npm run test:run
```
- Single run (no watch)
- Suitable for GitHub Actions, GitLab CI, etc.

---

## Best Practices

### 1. **Test Structure (AAA Pattern)**
```typescript
it('should do X when Y happens', () => {
  // Arrange: Set up test data
  const input = { id: 1, value: 10 };
  
  // Act: Execute the function/method
  const result = service.process(input);
  
  // Assert: Verify the result
  expect(result).toBe(expected);
});
```

### 2. **Testing Async Operations**
```typescript
it('should handle async HTTP calls', async () => {
  const result = await service.fetchData();
  expect(result).toBeDefined();
});

// OR with RxJS
it('should handle observable streams', (done) => {
  service.getData().subscribe((data) => {
    expect(data).toBeDefined();
    done();
  });
});
```

### 3. **Testing AG Grid Interactions**
```typescript
it('should trigger cellValueChanged event', (done) => {
  const event = {
    data: { id: 1 },
    colDef: { field: 'amount' },
    newValue: 150,
    oldValue: 100,
  };
  
  component.onCellValueChanged(event);
  
  fixture.detectChanges();
  fixture.whenStable().then(() => {
    expect(chargeService.updateCharge).toHaveBeenCalled();
    done();
  });
});
```

### 4. **Mocking HTTP Calls**
```typescript
it('should handle API errors gracefully', () => {
  chargeService.getCharges.and.returnValue(
    throwError(() => new HttpErrorResponse({ status: 500 }))
  );
  
  component.ngOnInit();
  
  expect(component.errorMessage).toContain('Failed to load');
});
```

### 5. **Code Coverage Goals**
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Set baseline and incrementally improve over time.

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Migration Path from Karma/Jasmine

If you later migrate from Karma/Jasmine:

1. **API is compatible**: Most `describe()`, `it()`, `expect()` code works as-is
2. **Update imports**: Change `@angular/core/testing` imports if needed
3. **Remove Karma config**: Delete `karma.conf.js` and related files
4. **Update test files**: Change `*.spec.ts` to use Vitest imports where needed
5. **Run coverage**: Ensure coverage thresholds are met

---

## Resources

- **Vitest Docs**: https://vitest.dev/
- **Testing Library Angular**: https://testing-library.com/angular
- **Angular Testing Guide**: https://angular.dev/guide/testing
- **AG Grid Testing**: https://www.ag-grid.com/javascript-data-grid/testing/

---

## Summary

**Vitest** is the modern choice for testing Angular applications because it's:
✅ Fast (10-100x faster)
✅ Simple to configure
✅ TypeScript-first
✅ Jest-compatible API
✅ Better developer experience

For the clinic-charge project, prioritize testing:
1. **API Service** (HTTP calls, pagination, filtering)
2. **Grid Component** (server-side rendering, inline editing, refresh)
3. **Filter Component** (state management, event emissions)
4. **Error handling** (failed updates, API errors)

