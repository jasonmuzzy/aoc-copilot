import 'dotenv/config';
import { request as stdRequest, RequestOptions, } from 'node:https';

const cookieSteps = `
In Chromium-based browsers like Chrome and Edge you can obtain your cookie by
visiting the site, logging in, opening developer tools (F12), and clicking
Application then expanding Cookies under the Storage section, locating the
adventofcode.com cookie, and copying the session value.

Then, add the following line to a .env file in the root of your project:
AOC_SESSION_COOKIE="session=<your session cookie value>"

NOTE: Protect your session ID!  For example, add .env to your .gitignore file.
`;

const errExpiredSessionCookie = `
Expired Session Cookie

Your session cookie seems to have expired or is no longer valid.  Please
retrieve a new session ID and update your .env file.
` + cookieSteps;

const errSelfSignedCertInChain = `
This error occurs on networks that uses a self-signed certificate to inspect
encrypted traffic, which is common in coporate environments, but could also
indicate a man-in-the-middle attack.

If you need to override the trusted CA certificates, you can add them with
CERTIFICATE="<your certificate(s)>" in your .env file.

See options.ca at https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions
`;

const errUnableToGetIssuerCertLocally = `
This error may occur when you've added CERTIFICATE="<your certificate(s)>" in
your .env file but are not on a network that uses self-signed certificates.

Try connecting to the network that uses self-signed certificates -- commonly a
corporate network -- or removing the certificate from your .env file.
`;

function legacyRequest(method: string, path: string, cookie: string, ca?: string, formData?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const options: RequestOptions = {
            hostname: "adventofcode.com",
            path,
            method,
            ca,
            headers: {
                cookie,
                "user-agent": "github.com/jasonmuzzy/aoc-copilot by aoc-copilot@outlook.com"
            },
        };
        if (method === 'POST' && !!formData) options.headers!["Content-Type"] = "application/x-www-form-urlencoded";
        const req = stdRequest(options, res => {
            let body = "";
            res.on("data", chunk => body += chunk);
            res.on("end", () => resolve(body));
        });
        req.on('error', error => {
            if ((error as any)?.code === 'SELF_SIGNED_CERT_IN_CHAIN') { // https://www.reddit.com/r/typescript/comments/11yilc1/how_the_hell_do_you_handle_exceptions_in/
                reject(new Error(`HTTP ${(error as any)?.code}\n${errSelfSignedCertInChain}`));
            } else if ((error as any)?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
                reject(new Error(`HTTP ${(error as any)?.code}\n${errUnableToGetIssuerCertLocally}`));
            } else reject(error);
        });
        req.on('response', res => { // When the session cookie expires we get a redirect
            if (res.statusCode !== undefined && res.statusCode > 299) {
                const isRedirect = (statusCode: number) => statusCode >= 300 && statusCode <= 399;
                const msg = isRedirect(res.statusCode)
                    ? errExpiredSessionCookie
                    : res.statusMessage;
                reject(new Error(`HTTP ${res.statusCode}\n${msg}`));
            }
        });
        if (method === 'POST' && !!formData) req.write(formData);
        req.end()
    });
}

async function request(method: string, path: string, cookie: string, ca?: string, formData?: string): Promise<string> {
    if (!!ca) {
        // we can't set a cert chain with `fetch()`, can only disable cert
        // validation: https://github.com/orgs/nodejs/discussions/44038
        // so instead of doing that, use the previous version
        return legacyRequest(method, path, cookie, ca, formData);
    }

    const headers = new Headers();
    headers.set('agent', 'github.com/jasonmuzzy/aoc-copilot by aoc-copilot@outlook.com');
    headers.set('cookie', cookie);

    const url = new URL(path, 'https://adventofcode.com');
    const options: RequestInit = {
        method,
        headers,
        redirect: 'manual'
    };

    if (method === 'POST' && !!formData) {
        options.body = formData;
        headers.set('content-type', 'application/x-www-form-urlencoded');
    } else if (!!formData) {
        url.search = formData;
    }

    try {
        const response = await fetch(url, options);
        if (response.redirected) {
            throw new Error(`HTTP ${response.status}\n${errExpiredSessionCookie}`);
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}\nFetch Error`);
        }

        const body = await response.text();
        return body;
    } catch (error: any) {
        if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
            throw new Error(`HTTP ${error.code}\n${errSelfSignedCertInChain}`)
        }
        throw error;
    }
}

export {
    cookieSteps,
    errExpiredSessionCookie,
    request
}