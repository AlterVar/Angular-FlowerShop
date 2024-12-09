export type CartType = {
  items: {
    product: {
      id: string,
      image: string,
      name: string,
      price: number,
      url: string
    },
    quantity: number
  }[]
}
