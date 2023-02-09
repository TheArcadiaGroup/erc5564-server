interface GeneralHelper {
  randomNumber(min: number, max: number): number,
  randomItemInArray(array: any[]): any | null,
  sleep(time: number): Promise<void>,
  now(): number,
  newExpiryTime(howManyMin?: number): number,
  capitalize(str: string): string
}

let GeneralHelper: GeneralHelper = {
  randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
  randomItemInArray(array: any[]): any | null {
    if (!Array.isArray(array) || array.length === 0) {
      return null
    }
    if (array.length === 1) {
      return array[0]
    }
    return array[GeneralHelper.randomNumber(0, array.length - 1)]
  },
  async sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time))
  },
  now(): number {
    return Math.floor(Date.now() / 1000)
  },
  newExpiryTime(howManyMin: number = 5): number {
    return GeneralHelper.now() + howManyMin * 60
  },
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
}

export default GeneralHelper



