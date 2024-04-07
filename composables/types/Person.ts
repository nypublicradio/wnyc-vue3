import type ISocial from './Social'
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
  photoID?: any
  jobTitle?: string
  biography?: string
  website?: string
  email?: string
  slug?: string
  shows?: IShow[]
}
