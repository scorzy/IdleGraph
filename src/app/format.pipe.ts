import { Pipe, PipeTransform } from '@angular/core';
import { ServService } from './serv.service';

@Pipe({
  name: 'format'
})
export class FormatPipe implements PipeTransform {
  constructor(public serv: ServService) {  }
  transform(value: any, args?: any): any {
    return this.serv.options.formatter.format(value)
  }

}
