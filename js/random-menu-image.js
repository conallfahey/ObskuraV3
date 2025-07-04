// Script to randomly select an image from img/photo folder for the multi-menu background

document.addEventListener('DOMContentLoaded', function() {
    // Array of image paths in the img/photo folder
    const photoImages = [
        'img/photo/AnnaMorganBoilerRoom.jpg',
        'img/photo/AnnaMorgan_BoilerRoom.jpg',
        'img/photo/BenBohmer_SaltShed.jpg',
        'img/photo/Bicep_CRSSD.jpg',
        'img/photo/BobMosesElectricForest.jpg',
        'img/photo/ChanceTheRapperBW.jpg',
        'img/photo/ChaseStatus_AragonTheater.jpg',
        'img/photo/ClaudeVonstrokeChicago.jpg',
        'img/photo/DEADSHED_SaltShed.jpg',
        'img/photo/DailyBread_Radius.jpg',
        'img/photo/Daya_PrideInThePark.jpg',
        'img/photo/DenzelCurry_RivieraTheater.jpg',
        'img/photo/ElderBrook_SaltShed(2).jpg',
        'img/photo/ElderBrook_SaltShed.jpg',
        'img/photo/FlyNari.jpg',
        'img/photo/LSZEE-Night2-3.jpg',
        'img/photo/LSZEE_SaltShed.jpg',
        'img/photo/LTC.jpg',
        'img/photo/LYNY-1.jpg',
        'img/photo/M.E.H..jpg',
        'img/photo/Mamitas_WindyCitySmokeout.jpg',
        'img/photo/Mamitas_WindyCitySmokeout2.jpg',
        'img/photo/MoodyGoodRadius-17.jpg',
        'img/photo/MoodyGood_ElectricForest.jpg',
        'img/photo/NyeAragon.jpg',
        'img/photo/RadiusFan.jpg',
        'img/photo/SIREN_Ramova.jpg',
        'img/photo/ZHU_Lollapalooza.jpg'
    ];
    
    // Function to get a random image from the array
    function getRandomImage() {
        const randomIndex = Math.floor(Math.random() * photoImages.length);
        return photoImages[randomIndex];
    }
    
    // Set the random image as the background for the menu item map
    const menuItemMap = document.querySelector('.menuUzi__item-map');
    if (menuItemMap) {
        const randomImage = getRandomImage();
        menuItemMap.style.backgroundImage = `url(${randomImage})`;
    }
});