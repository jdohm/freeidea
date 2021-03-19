'use strict';

function sendLogin() {
            if(!document.forms.login_form.email.checkValidity()) {
                document.getElementById("email").className += " invalid";
                return false;
            }
            if(!document.forms.login_form.password.checkValidity()) {
                document.getElementById("password").className += " invalid";
                return false;
            }
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var obj = JSON.parse(this.responseText);
                    if(obj.hasOwnProperty("message")) {
                        document.getElementById("error_server").innerHTML = obj.message;
                    }
                    else {
                        myLogin(obj);
                        SidePanel.hide();
                    }
                }};
            xhttp.open("POST", "submitLogin", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("email="+document.getElementById("email").value+"&password="+document.getElementById("password").value);
};
export { sendLogin };

function showLogin() {
    var html = `
<div style="overflow-y: auto;flex-grow: 1;">
  <div class="row">
    <form class="col s12" name="login_form">
      <div class="row">
<h6>Login</h6>
      </div>
      <div class="row">
        <div class="input-field col s10">
          <input id="email" type="text" name="email" class="validate" required/>
          <label for="email">E-mail address or username</label>
        </div>
      </div>
      <div class="row">
        <div class="input-field col s10">
          <input id="password" type="password" name="password" class="validate" required/>
          <label for="password">Password</label>
            <div id="error_server"></div>
        </div>
      </div>
      <div class="row">
<button class="btn waves-effect waves-light oi-custom-greys" type="button" name="action" onclick='SideLoginRegister.sendLogin()'>Login
    <i class="material-icons right">send</i>
  </button>
      </div>
    </form>
  </div>
</div>
<div style="flex-grow: 0;">
<button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" type="button" name="back" onclick='SidePanel.hide()'>Back <i class="material-icons left">arrow_back</i>
  </button>
</div>
`
    SidePanel.show(html);
    document.getElementById("password").addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            SideLoginRegister.sendLogin();
        }
    });
    M.updateTextFields();
};
export { showLogin };


function sendRegister() {
                if(!document.forms.register_form.email.checkValidity()) {
                    document.getElementById("email").className += " invalid";
                    return false;
                }
                if(!document.forms.register_form.name.checkValidity()) {
                    document.getElementById("name").className += " invalid";
                    return false;
                }
                if(!document.forms.register_form.password.checkValidity()) {
                    document.getElementById("password").className += " invalid";
                    return false;
                }
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var obj = JSON.parse(this.responseText);
                        if(obj.hasOwnProperty("message")) {
                            if(obj.message.search("name") >= 1) {
                                document.getElementById("error_name").innerHTML = "Username already in use.";
                                document.getElementById("name").className += " invalid";
                            }
                            else if(obj.message.search("email") >= 1){
                                document.getElementById("error_mail").innerHTML = "Email already in use.";
                                document.getElementById("email").className += " invalid";
                            }
                            else alert(obj.message);
                        }
                        else {
                            SidePanel.hide();
                        }
                    }};
                xhttp.open("POST", "submitRegister", true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("name="+document.getElementById("name").value+"&email="+document.getElementById("email").value+"&password="+document.getElementById("password").value);
};
export { sendRegister };


function showRegister() {
        var html =
    `
<div style="overflow-y: auto;flex-grow: 1;">
    <div class="row">
        <form class="col s12" name="register_form">
            <div class="row">
                <h6>Register</h6>
            </div>
            <div class="row">
                <div class="input-field col s10">
                    <input id="email" type="email" name="email" class="validate" required />
                    <label for="email">E-mail address</label>
                </div>
            </div>
            <div class="row">
                <div class="input-field col s10">
                    <input id="name" type="text" name="name" class="validate" required />
                    <label for="name">Username</label>
                </div>
            </div>
            <div class="row">
                <div class="input-field col s10">
                    <input id="password" type="password" name="password" class="validate" pattern=".{8,}" required />
                    <label for="password">Password</label>
                    <span class="helper-text" data-error="Can't be empty - at least 8 characters" data-success="">Min 8 characters</span>
                    <div id="error_server"></div>
                </div>
            </div>
            <div class="row">
                <button class="btn waves-effect waves-light oi-custom-greys" type="button" name="action" onclick='SideLoginRegister.sendLogin()'>Register
                    <i class="material-icons right">send</i>
                </button>
            </div>
        </form>
    </div>
</div>
<div style="flex-grow: 0;">
    <button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" type="button" name="back" onclick='SidePanel.hide()'>Back <i class="material-icons left">arrow_back</i>
    </button>
</div>
</div>    `;
    SidePanel.show(html);
    document.getElementById("password").addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            SideLoginRegister.sendRegister();
        }
    });
    M.updateTextFields();
};

export { showRegister };
