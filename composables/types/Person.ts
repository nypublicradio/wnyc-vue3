import type ISocial from '../types/Social'
interface IShow {
  title: string
  slug: string
  image: string
}
export default interface Person {
  id?: number
  url?: string
  name?: string
  socialMediaProfile?: ISocial[]
  photoID?: number
  jobTitle?: string
  biography?: string
  website?: string
  email?: string
  slug?: string
  shows?: IShow[]
}
