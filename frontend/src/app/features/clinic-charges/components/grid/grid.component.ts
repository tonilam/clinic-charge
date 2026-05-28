import { Component, OnDestroy, effect, inject, signal } from '@angular/core';
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
  NumberEditorModule,
  PaginationModule,
  TextEditorModule,
} from 'ag-grid-community';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import { ClinicCharge } from '../../../../shared/models/clinic-charge.model';

ModuleRegistry.registerModules([
  InfiniteRowModelModule,
  PaginationModule,
  TextEditorModule,
  NumberEditorModule,
]);

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './grid.component.html',
})
export class GridComponent implements OnDestroy {
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
