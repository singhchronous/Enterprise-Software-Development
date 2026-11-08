// decodeJwtPayload — STRETCH (section 10). Reads the middle part of a JWT, for DISPLAY only.
//
//   decodeJwtPayload(credential)   //=> { iss, aud, sub, email, email_verified, name, exp, … }
//
// It checks NOTHING: not the signature, not who issued the token, not which app it's for,
// not whether it has expired. Anyone can type up a string this function decodes happily
// (section 05). So never decide anything with what it returns — who is logged in comes from
// YOUR backend (GET /api/users/me), after it verified the token.
//
// A JWT is three base64url parts joined by dots: header.payload.signature. base64url is
// base64 with - and _ instead of + and /, and without the = padding. atob() wants plain
// base64, and gives back one character per BYTE — so a name like "Zoë" (two bytes for ë,
// in UTF-8) needs TextDecoder to turn the bytes back into text.
export function decodeJwtPayload(token) {
  throw new Error("TODO");
}
