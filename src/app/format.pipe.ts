import { Pipe, PipeTransform } from '@angular/core';
import { ServService } from './serv.service';

@Pipe({
  name: 'format'
})
export class FormatPipe implements PipeTransform {
  constructor(public serv: ServService) {  }
  transform(value: any, args?: any): any {
    value = new Decimal(value)
    return this.serv.options.usaFormat ?
    (
      value.abs().lessThan(10) ? value.toNumber().toFixed(2).replace(/\.0+$/, '') :
        value.abs().lessThan(100) ? value.toNumber().toFixed(1).replace(/\.0+$/, '') :
          (value.greaterThanOrEqualTo(0) ? "" : "-") + this.serv.options.formatter.formatShort(value.abs())
    ) : (
      value.abs().lessThan(10) ? value.toNumber().toFixed(2).replace(/\.0+$/, '').replace(".", ",") :
        value.abs().lessThan(100) ? value.toNumber().toFixed(1).replace(/\.0+$/, '').replace(".", ",") :
          (value.greaterThanOrEqualTo(0) ? "" : "-") + this.serv.options.formatter.formatShort(value.abs()).replace(".", ",")
    )

  }

}
