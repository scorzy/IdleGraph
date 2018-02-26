import { numberformat } from 'swarm-numberformat'

export class Options {

  formatter = new numberformat.Formatter({ format: 'standard', sigfigs: 2, flavor: 'short' })
  colAlert = true
  sacAlert = true

  constructor() {

  }
}
