import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-archivos',
  standalone: true,
  imports: [CommonModule, DialogModule,ToastModule],
  templateUrl: './Archivos.component.html',
  styleUrl:'./Archivos.component.scss',
})
export class ArchivosComponent implements OnInit {
@Input() visible:boolean = false;
@Input() factura:string = ""; 
@Output() closeEvent = new EventEmitter<boolean>();
public links:string[] = []; 

constructor(private http: HttpClient) {}
ngOnInit(): void 
{
    var obj = JSON.parse(this.factura); 
    for(let item of obj)
      {
        this.links.push(item); 
      }
 }
  
  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }    

  
  downloadPdfDirect(pdfUrl: string) {
  window.open(pdfUrl, '_blank');
}



obtenerLinkPdf():string
{
  let link = "";
  let temp = this.links.filter(x => x.includes(".pdf"))[0]; 
  if(temp != undefined){ link = temp;}
  return link;  
} 

obtenerLinkXml():string
{
  let link = "";
  let temp = this.links.filter(x => x.includes(".xml"))[0]; 
  if(temp != undefined){ link = temp;}
  return link;  
}

}
