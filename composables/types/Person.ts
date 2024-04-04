interface SocialMediaProfile {
  id: number
  service: string
  profileUrl: string
}
interface IShow {
  title: string
  slug: string
  image: string
}
export default interface Person {
  id?: number
  url?: string
  name?: string
  socialMediaProfile?: SocialMediaProfile[]
  photoID?: number
  jobTitle?: string
  biography?: string
  website?: string
  email?: string
  slug?: string
  shows?: IShow[]
}
