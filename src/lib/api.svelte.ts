export interface Gift {
  id: string
  name: string
  owner: string
  imageUrl: string
  quantity?: number
  price?: number
}

const api = {
  gifts: {
    async save(gifts: Gift[]) {
      localStorage.setItem('gifts', JSON.stringify(gifts))

      return await Promise.resolve()
    },

    async list(): Promise<Gift[]> {
      return await JSON.parse(localStorage.getItem('gifts') || '[]')
    }
  }
}

export default api
