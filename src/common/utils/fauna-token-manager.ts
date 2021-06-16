import Cookies from 'universal-cookie'

const cookiesHandler = new Cookies()

export const FAUNA_TOKEN_NAME = 'fauna-token'

class FaunaTokenManager {
  private cookies?: Record<string, string>

  public constructor(cookies: Record<string, string> | undefined = undefined) {
    this.cookies = cookies
  }

  public get = (): string => {
    let cookie: string | undefined
    // If no array of cookies was provided when instatiating the service
    if (typeof this.cookies === 'undefined') {
      // Get cookie value from the actual cookies
      cookie = cookiesHandler.get(FAUNA_TOKEN_NAME)
      // iF an array of cookies was provided when instatiating the service
    } else {
      // Get cookie value from the provided array of cookies
      cookie = this.cookies[FAUNA_TOKEN_NAME]
    }

    // If cookie was not set, return public Fauna key
    if (typeof cookie === 'undefined') {
      if (typeof process.env.NEXT_PUBLIC_FAUNA_SECRET === 'undefined') {
        throw new Error(
          'Environment variable NEXT_PUBLIC_FAUNA_SECRET is missing.'
        )
      }

      return process.env.NEXT_PUBLIC_FAUNA_SECRET
    }

    // Otherwise, return cookie value
    return cookie
  }

  public set = (token: string): void => {
    cookiesHandler.set(FAUNA_TOKEN_NAME, token)
  }

  public reset = (): void => {
    cookiesHandler.remove(FAUNA_TOKEN_NAME)
  }
}

export default FaunaTokenManager
