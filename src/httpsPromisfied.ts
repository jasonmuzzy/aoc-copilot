import 'dotenv/config';
import { IncomingHttpHeaders } from 'node:http';
import { request as stdRequest, RequestOptions,  } from 'node:https';

function request(method: string, path: string, cookie?: string, ca?: string, formData?: string): Promise<{ headers: IncomingHttpHeaders, body: string }> {
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
            res.on("end", () => resolve({ headers: res.headers, body }));
        })
        req.on("error", error => {
            if ((error as any)?.code === 'SELF_SIGNED_CERT_IN_CHAIN') { // https://www.reddit.com/r/typescript/comments/11yilc1/how_the_hell_do_you_handle_exceptions_in/
                reject(new Error(`HTTP Error: ${(error as any)?.code}

This error occurs on networks that uses a self-signed certificate to inspect
encrypted traffic, which is common in coporate environments, but could also
indicate a man-in-the-middle attack.

If you need to override the trusted CA certificates, you can add them with
CERTIFICATE="<your certificate(s)>" in your .env file.

See options.ca at https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions
`));
} else if ((error as any)?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
    reject(new Error(`HTTP Error: ${(error as any)?.code}

This error may occur when you've added CERTIFICATE="<your certificate(s)>" in
your .env file but are not on a network that uses self-signed certificates.

Try connecting to the network that uses self-signed certificates -- commonly a
corporate network -- or removing the certificate from your .env file.
`));
} else reject(error);
        });
        if (method === 'POST' && !!formData) req.write(formData);
        req.end()
    });
}

export {
    request
}