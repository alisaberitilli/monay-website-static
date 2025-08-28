require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function getToken(EMAIL, PASS) {
  const {
    data: { users },
  } = await supabaseClient.auth.admin.listUsers();
  const arvindUser = users.find((user) => user.email === EMAIL);
  // delete user if exists
  if (arvindUser) {
    const { data, error } = await supabaseClient.auth.admin.deleteUser(
      arvindUser.id
    );
    if (error) console.log(error);
    // console.log("DELETED USER", data, error);
  }

  // recreate user
  const { data, error } = await supabaseClient.auth.admin.createUser({
    email: EMAIL,
    email_confirm: true,
    password: PASS,
  });

  if (!error) {
    // console.log("CREATED USER:", data?.user);
  } else {
    console.log(error);
  }

  // create user session
  const { data: authData, error: authError } =
    await supabaseClient.auth.signInWithPassword({
      email: EMAIL,
      password: PASS,
    });

  if (!authError) {
    // console.log("USER SIGNED IN:", authData.user);
    console.log("TOKEN:");
    const token = authData.session?.access_token;
    return token;
  } else {
    console.log(authError);
  }
}

module.exports = getToken;
