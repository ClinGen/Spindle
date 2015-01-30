$(document).ready(function() {
	$('#changepwd').click(function() {
		$('#pwdwin').fadeIn(50, function() {
			var htmlstr = '<table align="center" valign="center">';
			htmlstr += '<tr><td>Current Password:</td><td><input type="password" id="pwd" name="pwd" /></td></tr>';
			htmlstr += '<tr><td>Password:</td><td><input type="password" id="newpwd" name="newpwd" /></td></tr>';
			htmlstr += '<tr><td>Enter Again:</td><td><input type="password" id="newpwd2" name="newpwd2" /></td></tr>';
			htmlstr += '<tr><td><input type="button" value="Enter" id="pwdsendbnt" /></td><td><input type="button" value="Reset" id="resetbnt" /></td></tr>';
			htmlstr += '</table>';
			$("#wincontent").html(htmlstr);
			$("#winalert").html("");

			$("#pwd").focus();
			$("#pwdsendbnt").click(function() {
				if ($.trim($("#pwd").val()) === "") {
					$("#winalert").html('Enter your current password.');
					$("#pwd").focus();
				}
				else if ($.trim($("#newpwd").val()) === "") {
					$("#winalert").html('Enter your new password.');
					$("#newpwd").focus();
				}
				else if ($.trim($("#newpwd2").val()) === "") {
					$("#winalert").html('Enter new password again.');
					$("#newpwd2").focus();
				}
				else if ($.trim($("#newpwd2").val()) !== $.trim($("#newpwd").val())) {
					$("#winalert").html('Not identical. Enter new password again.');
					$("#newpwd").val('');
					$("#newpwd2").val('');
					$("#newpwd").focus();
				}
				else {
					var str = {pwd: $("#pwd").val().replace(/(^\s*)|(\s*$)/g, ''), newpwd: $("#newpwd").val().replace(/(^\s*)|(\s*$)/g, '')};
					$.post("/changepassword/", str, function(data) {
						$("#wincontent").html(data);
						$("#winalert").html("");
					});
				}
			});
			$("#resetbnt").click(function() {
				$("#pwd").val("");
				$("#newpwd").val("");
				$("#newpwd2").val("");
				$("#winalert").html("");
				$("#pwd").focus();
			});
		});
	});
	$('#closelink').click(function(){$('#pwdwin').fadeOut();});
});
