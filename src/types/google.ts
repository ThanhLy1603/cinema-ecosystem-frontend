export interface GoogleCredentialResponse {
  credential: string
}

export interface GoogleIdConfiguration {
  client_id: string
  callback: (googleCredentialResponse: GoogleCredentialResponse) => void
  ux_mode?: 'popup' | 'redirect'
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

export interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill'
  width?: number
  locale?: string
}

export interface GoogleAccountsId {
  initialize: (googleIdConfiguration: GoogleIdConfiguration) => void
  renderButton: (parent: HTMLElement, googleButtonConfiguration: GoogleButtonConfiguration) => void
}

export interface GoogleApi {
  accounts: {
    id: GoogleAccountsId
  }
}

declare global {
  interface Window {
    google?: GoogleApi
  }
}
