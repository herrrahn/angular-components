import {AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTable, MatTableDataSource} from '@angular/material';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen Hydrogen Hydrogen Hydrogen Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit, AfterViewInit {
  title = 'RRR GRID';
  @ViewChild(MatTable, {read: ElementRef, static: true}) private matTableRef: ElementRef;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  columns: any[] = [
    {field: 'position', width: 100, visible: true, order: 0},
    {field: 'name', width: 350, visible: true, order: 1},
    {field: 'weight', width: 250, visible: true, order: 2},
    {field: 'symbol', width: 100, visible: true, order: 3}
  ];
  originalColumns = this.columns;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  pressed = false;
  currentResizeIndex: number;
  startX: number;
  startWidth: number;
  isResizingRight: boolean;
  resizableMousemove: () => void;
  resizableMouseup: () => void;

  currentSort = '';
  currentDirection: 'asc' | 'desc';
  showColsSelector = false;

  constructor(
    private renderer: Renderer2
  ) {
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.setDisplayedColumns();
  }

  ngAfterViewInit() {
    this.setTableResize(this.matTableRef.nativeElement.clientWidth);
  }

  setTableResize(tableWidth: number) {
    let totWidth = 0;
    this.columns.forEach((column) => {
      totWidth += column.width;
    });
    console.log('T:', totWidth);
    const scale = (tableWidth - 5) / totWidth;
    this.columns.forEach((column) => {
      column.width *= scale;
      this.setColumnWidth(column);
    });
  }

  setDisplayedColumns() {
    this.columns.forEach((column, index) => {
      column.index = index;
      if (column.visible) {
        this.displayedColumns[index] = column.field;
      }
    });
  }

  onResizeColumn(event: any, index: number, header) {
    const elementById = document.getElementById(header);
    this.checkResizing(event, index);
    this.currentResizeIndex = index;
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = elementById.clientWidth;
    event.preventDefault();
    this.mouseMove(index);
  }

  private checkResizing(event, index) {
    const cellData = this.getCellData(index);
    if ((index === 0) || (Math.abs(event.pageX - cellData.right) < cellData.width / 2 && index !== this.columns.length - 1)) {
      this.isResizingRight = true;
    } else {
      this.isResizingRight = false;
    }
  }

  private getCellData(index: number) {
    const headerRow = this.matTableRef.nativeElement.children[0];
    const cell = headerRow.children[index];
    return cell.getBoundingClientRect();
  }

  mouseMove(index: number) {
    this.resizableMousemove = this.renderer.listen('document', 'mousemove', (event) => {
      if (this.pressed && event.buttons) {
        const dx = (this.isResizingRight) ? (event.pageX - this.startX) : (-event.pageX + this.startX);
        const width = this.startWidth + dx;
        if (this.currentResizeIndex === index && width > 50) {
          this.setColumnWidthChanges(index, width);
        }
      }
    });
    this.resizableMouseup = this.renderer.listen('document', 'mouseup', (event) => {
      if (this.pressed) {
        this.pressed = false;
        this.currentResizeIndex = -1;
        this.resizableMousemove();
        this.resizableMouseup();
      }
    });
  }

  setColumnWidthChanges(index: number, width: number) {
    const orgWidth = this.columns[index].width;
    const dx = width - orgWidth;
    if (dx !== 0) {
      const j = (this.isResizingRight) ? index + 1 : index - 1;
      const newWidth = this.columns[j].width - dx;
      if (newWidth > 50) {
        this.columns[index].width = width;
        this.setColumnWidth(this.columns[index]);
        this.columns[j].width = newWidth;
        this.setColumnWidth(this.columns[j]);
      }
    }
  }

  setColumnWidth(column: any) {
    const columnEls = Array.from(document.getElementsByClassName('mat-column-' + column.field));
    columnEls.forEach((el: HTMLDivElement) => {
      el.style.width = column.width + 'px';
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setTableResize(this.matTableRef.nativeElement.clientWidth);
  }

  sortField(field: string) {
    this.orderData(field);
  }

  orderData(id: string, start?: 'asc' | 'desc') {
    const matSort = this.dataSource.sort;
    const disableClear = false;

    if (this.currentDirection === 'asc') {
      this.currentDirection = 'desc';
    } else {
      this.currentDirection = 'asc';
    }
    start = this.currentDirection;

    this.currentSort = id;

    matSort.sort({id: null, start, disableClear});
    matSort.sort({id, start, disableClear});

    this.dataSource.sort = this.sort;

    this.setTableResize(this.matTableRef.nativeElement.clientWidth);
  }

  paging(withTimer = false) {
    if (withTimer) {
      setTimeout(() => {
        this.setTableResize(this.matTableRef.nativeElement.clientWidth);
      });
    } else {
      this.setTableResize(this.matTableRef.nativeElement.clientWidth);
    }
  }

  configureCols(field: any) {
    const goingVisible = !field.visible;
    this.columns = this.originalColumns.filter(o => {
      return o.visible === true;
    });
    if (!goingVisible) {
      this.columns = this.columns.filter(c => c.field !== field.field);
    } else {
      this.columns.push({field: field.field, width: field.width, visible: true, order: field.order});
    }

    this.columns.sort((a, b) => {
      if (a.order > b.order) {
        return 1;
      } else {
        return -1;
      }
    });
    setTimeout(() => {
      this.setTableResize(this.matTableRef.nativeElement.clientWidth);
    });
  }

  getDisplayedColumns(): any[] {
    return this.columns
      .filter(cd => cd.visible)
      .map(cd => cd.field);
  }

  selectAll() {
    this.originalColumns.forEach(o => o.visible = true);
    this.columns = this.originalColumns;
    setTimeout(() => {
      this.setTableResize(this.matTableRef.nativeElement.clientWidth);
    });
  }
}
