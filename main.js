const colors = {
    blue_background: "#324c83",
}
   document.addEventListener("DOMContentLoaded", function () {
        // Get elements
        const hungryLogo = document.querySelector('.hungry-logo');
        const homeLogo = document.querySelector('.home-logo');
        const homeButtons = document.querySelector('.home-buttons');
        const blackScreen = document.createElement('div'); // Create a black screen div
        const metaThemeColor = document.querySelector("meta[name='theme-color']"); // Get the theme-color meta tag

        // Set up the black screen
        blackScreen.classList.add('black-screen');
        document.body.appendChild(blackScreen); // Append it to the body

        // Start the process after 3 seconds
        setTimeout(() => {
            // Fade out the hungry logo and change the theme color to black
            hungryLogo.classList.add('fade-out');
            metaThemeColor.setAttribute("content", "#000000"); // Change status bar color to black

            // After 1 second (time for the logo to fade out), show the black screen
            setTimeout(() => {
                blackScreen.style.opacity = 1; // Make the black screen visible

                // After the black screen is fully visible (1 second), hide the hungry logo and show other elements
                setTimeout(() => {
                    hungryLogo.style.display = 'none'; // Hide the hungry logo
                    homeLogo.style.display = 'block'; // Show the home logo
                    homeButtons.style.display = 'block'; // Show the home buttons

                    // Fade out the black screen
                    blackScreen.style.opacity = 0;

                    // After the black screen fades out (1 second), revert the theme color
                    setTimeout(() => {
                        blackScreen.remove(); // Remove the black screen
                        metaThemeColor.setAttribute("content", "#183CB5"); // Change back to original theme color
                    }, 1000); // Wait for the fade out transition to complete
                }, 1000); // Wait for the black screen to be fully visible
            }, 1000); // Wait for the hungry logo to fade out
        }, 3000); // Wait for 3 seconds before starting the fade effect
    });
