mailer = require('../mailer');
csp = require('js-csp');

var emailParams = {from: 'abc@example.com',
            to: 'def@example.com',
            subject: 'asdfjkl',
            token: "983743047563123489875958[9"
    };

describe('password reset email', function() {
   it('contains a link with the reset token', function() {
        mailer.setStubTransport();
       csp.go(function*(){
           var result = yield csp.take(mailer.passwordResetEmail(emailParams));
           expect(result).toMatch("983743047563123489875958[9")
       })
   });

    it('is sent to the correct email address', function() {
        mailer.setStubTransport();
        csp.go(function*() {
            var result = yield csp.take(mailer.passwordResetEmail(emailParams));
            expect(result).toMatch("To: def@example.com");
        })

    });

    it('handles email errors', function() {
        mailer.setFailingTransport();
        csp.go(function*() {
            var result = yield csp.take(mailer.passwordResetEmail(emailParams));
            expect(result instanceof Error).toBe(true);
        })
    })
});