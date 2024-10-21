import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timePipe',
  standalone: true
})
export class TimePipePipe implements PipeTransform {

  transform(value: any): string{
    if(!value) return ' ';
    const date =new Date(value)
    const hours = date.getHours().toString().padStart(2,'0');
    const minutes = date.getMinutes().toString().padStart(2,'0')
    return `${hours}:${minutes}`;
  }

}
