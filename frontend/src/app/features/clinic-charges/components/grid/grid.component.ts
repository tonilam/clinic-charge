import {
  Component,
  OnInit,
  OnDestroy,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellValueChangedEvent,
  IDatasource,
  IGetRowsParams,
  ModuleRegistry,
  InfiniteRowModelModule,
  PaginationModule,
} from 'ag-grid-community';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import { ClinicCharge } from '../../../../shared/models/clinic-charge.model';

ModuleRegistry.registerModules([InfiniteRowModelModule, PaginationModule]);

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="relative w-full" style="height: 600px;">
      <div
        *ngIf="loading()"
        class="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <ag-grid-angular
        class="ag-theme-quartz w-full h-full"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [rowModelType]="'infinite'"
        [datasource]="datasource"
        [pagination]="true"
        [paginationPageSize]="10"
        [cacheBlockSize]="10"
        (gridReady)="onGridReady($event)"
        (cellValueChanged)="onCellValueChanged($event)"
      />
    </div>

    <p *ngIf="errorMessage()" class="mt-2 text-sm text-red-600">{{ errorMessage() }}</p>
  `,
})
export class GridComponent implements OnInit, OnDestroy {
  private chargeService = inject(ClinicChargeService);
  private gridApi: GridApi | null = null;

  loading = signal(false);
  errorMessage = signal('');

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', editable: false, width: 80 },
    {
      field: 'medical_centre_name',
      headerName: 'Medical Centre',
      editable: true,
      flex: 2,
    },
    {
      field: 'patient_visit_type',
      headerName: 'Visit Type',
      editable: true,
      flex: 1,
    },
    { field: 'charge_type', headerName: 'Charge Type', editable: true, flex: 1 },
    {
      field: 'amount',
      headerName: 'Amount ($)',
      editable: true,
      flex: 1,
      valueFormatter: (p) => (p.value != null ? `$${Number(p.value).toFixed(2)}` : ''),
    },
  ];

  defaultColDef: ColDef = {
    sortable: false,
    resizable: true,
  };

  datasource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
      this.loading.set(true);
      this.chargeService.getCharges(params.startRow, params.endRow).subscribe({
        next: (res) => {
          this.loading.set(false);
          const lastRow = res.totalRecords <= params.endRow ? res.totalRecords : -1;
          params.successCallback(res.rows as unknown as Record<string, unknown>[], lastRow);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Failed to load clinic charges. Please try again.');
          params.failCallback();
        },
      });
    },
  };

  private refreshEffect = effect(() => {
    this.chargeService.getRefreshTrigger()();
    if (this.gridApi) {
      this.refreshGrid();
    }
  });

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.refreshEffect.destroy();
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
  }

  onCellValueChanged(event: CellValueChangedEvent<ClinicCharge>): void {
    if (!event.data?.id) return;
    const field = event.colDef.field as keyof ClinicCharge;
    if (!field) return;

    const payload = { [field]: event.newValue };
    this.chargeService.updateCharge(event.data.id, payload).subscribe({
      error: () => {
        event.node.setDataValue(field, event.oldValue);
        this.errorMessage.set('Failed to update charge. Changes reverted.');
      },
    });
  }

  refreshGrid(): void {
    this.gridApi?.purgeInfiniteCache();
  }
}
