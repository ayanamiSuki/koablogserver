export const jwtConfig = {
    tokenKey: 'aya_token',
    path: [
        /\/users\/signup/,
        /\/users\/signin/,
        /\/users\/verify/,
        /\/article\/getArticle/,
        /\/article\/recommend/,
        /\/comment\/getComment/,
        /^\/static\/.*/,
        /^\/dist\/.*/,
    ]
}