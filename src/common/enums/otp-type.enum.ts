export enum OtpType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  /** Login sem senha — código por e-mail (mesma tela de código do verification/reset no client). */
  LOGIN = 'login',
}
