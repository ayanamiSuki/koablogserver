export const jwtConfig = {
    tokenKey: 'aya_token',
    path: [
        /\/users\/signup/,
        /\/users\/signin/,
        /\/article\/getarticle/,
        /\/article\/recommend/,
        /\/comment\/getComment/,
        /^\/static\/.*/,
        /^\/dist\/.*/,
    ]
}