const supabaseProfile = window.chessfkSupabase;

let currentUser = null;
let currentProfile = null;

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function showAvatar(url) {
    const avatar = document.getElementById("profileAvatar");
    const fallback = document.getElementById("profileAvatarFallback");

    if (url) {
        avatar.src = url;
        avatar.style.display = "block";
        fallback.style.display = "none";
    } else {
        avatar.style.display = "none";
        fallback.style.display = "grid";
    }
}

function displayProfile(profile) {
    currentProfile = profile;

    setText("profileTitleName", profile.username || "PLAYER");
    setText("profileEmail", currentUser.email || "");
    setText("profileCountryView", "🌍 " + (profile.country || "Country not set"));

    document.getElementById("profileUsername").value = profile.username || "";
    document.getElementById("profileCountry").value = profile.country || "";

    setText("blitzRating", profile.blitz_rating || 800);
    setText("rapidRating", profile.rapid_rating || 800);
    setText("classicalRating", profile.classical_rating || 800);

    setText("gamesPlayed", profile.games_played || 0);
    setText("gamesWon", profile.games_won || 0);
    setText("winsWhite", profile.wins_as_white || 0);
    setText("winsBlack", profile.wins_as_black || 0);
    setText("gamesDrawn", profile.games_drawn || 0);
    setText("gamesLost", profile.games_lost || 0);
    setText("fkCoins", profile.fk_coins || 0);

    showAvatar(profile.avatar_url || "");
}

async function uploadNewAvatar(file) {
    if (!file || !currentUser) return;

    const message = document.getElementById("profileMessage");

    if (!file.type.startsWith("image/")) {
        message.textContent = "Choose a JPG, PNG or WEBP image.";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        message.textContent = "Image too large. Maximum 5 MB.";
        return;
    }

    message.textContent = "Uploading your photo...";

    const extension = file.name.split(".").pop().toLowerCase() || "jpg";
    const path = `${currentUser.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabaseProfile.storage
        .from("avatars")
        .upload(path, file, { upsert: false });

    if (uploadError) {
        message.textContent = "Upload error: " + uploadError.message;
        return;
    }

    const { data } = supabaseProfile.storage
        .from("avatars")
        .getPublicUrl(path);

    const avatarUrl = data.publicUrl;

    const { error: updateError } = await supabaseProfile
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", currentUser.id);

    if (updateError) {
        message.textContent = "Profile error: " + updateError.message;
        return;
    }

    currentProfile.avatar_url = avatarUrl;
    showAvatar(avatarUrl);
    message.textContent = "Photo updated successfully.";
}

async function saveProfileChanges() {
    const username = document.getElementById("profileUsername").value.trim();
    const country = document.getElementById("profileCountry").value;
    const message = document.getElementById("profileMessage");
    const button = document.getElementById("saveProfileButton");

    if (username.length < 3 || username.length > 20) {
        message.textContent = "Your username needs 3 to 20 characters.";
        return;
    }

    if (!country) {
        message.textContent = "Choose your country.";
        return;
    }

    button.disabled = true;
    button.textContent = "SAVING...";
    message.textContent = "";

    const { data, error } = await supabaseProfile
        .from("profiles")
        .update({ username, country })
        .eq("id", currentUser.id)
        .select()
        .single();

    button.disabled = false;
    button.textContent = "SAVE CHANGES →";

    if (error) {
        message.textContent = error.code === "23505"
            ? "This username already exists."
            : "Error: " + error.message;
        return;
    }

    displayProfile(data);
    message.textContent = "Profile saved successfully.";
}

async function startProfilePage() {
    const { data } = await supabaseProfile.auth.getSession();
    currentUser = data?.session?.user;

    if (!currentUser) {
        window.location.href = "../index.html";
        return;
    }

    const { data: profile, error } = await supabaseProfile
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

    if (error || !profile) {
        window.location.href = "../index.html";
        return;
    }

    document.getElementById("profileLoading").hidden = true;
    document.getElementById("profileContent").hidden = false;

    displayProfile(profile);

    document.getElementById("profilePhotoInput").addEventListener("change", (event) => {
        uploadNewAvatar(event.target.files?.[0]);
    });

    document.getElementById("saveProfileButton").addEventListener("click", saveProfileChanges);

    document.getElementById("profileSignOut").addEventListener("click", async () => {
        await supabaseProfile.auth.signOut();
        window.location.href = "../index.html";
    });
}

document.addEventListener("DOMContentLoaded", startProfilePage);
