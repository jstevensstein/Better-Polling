import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'notify-dialog',
  templateUrl: 'notify-dialog.html',
})
export class NotifyDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {title: string, message :string, closeName: string}) { }
}
