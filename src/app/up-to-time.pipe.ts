import { Pipe, PipeTransform } from '@angular/core'
import * as moment from 'moment'
import * as Decimal from 'break_infinity.js'

@Pipe({
  name: 'upToTime'
})
export class UpToTimePipe implements PipeTransform {

  transform(value: Decimal, args?: any): any {
    return moment.duration(value.toNumber(), 'seconds').humanize()
  }

}
