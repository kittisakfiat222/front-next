export interface User {
  id: number
  username: string
  fname?: string
  lname?: string
  avatar: string
  password: string
  email?: string
  tel?: string
  role: string
  createdAt: string
  updatedAt: string
  }
  
  export interface Pet {
    id : number 
    name : string
    avatar : string
  }