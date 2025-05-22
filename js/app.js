// Main application logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const fileInput1 = document.getElementById('file-input1');
  const fileInput2 = document.getElementById('file-input2');
  const dropArea1 = document.getElementById('drop-area1');
  const dropArea2 = document.getElementById('drop-area2');
  const preview1 = document.getElementById('preview1');
  const preview2 = document.getElementById('preview2');
  const collageTextInput = document.getElementById('collage-text');
  const createButton = document.getElementById('create-button');
  const downloadButton = document.getElementById('download-button');
  const newButton = document.getElementById('new-button');
  const errorMessage = document.getElementById('error-message');
  const creationPanel = document.getElementById('creation-panel');
  const resultPanel = document.getElementById('result-panel');
  const resultImage = document.getElementById('result-image');
  const languageSwitcher = document.getElementById('language-switcher');
  const currentYearElement = document.getElementById('current-year');

  // Set current year in footer
  currentYearElement.textContent = new Date().getFullYear();

  // Image storage
  const images = {
    image1: null,
    image2: null
  };

  // Language switcher
  languageSwitcher.addEventListener('click', () => {
    i18n.toggleLanguage();
  });

  // File input change handlers
  fileInput1.addEventListener('change', (e) => handleFileChange(e, 'image1', preview1, dropArea1));
  fileInput2.addEventListener('change', (e) => handleFileChange(e, 'image2', preview2, dropArea2));

  // Click handlers for drop areas
  dropArea1.addEventListener('click', () => fileInput1.click());
  dropArea2.addEventListener('click', () => fileInput2.click());

  // Drag and drop handlers
  setupDragAndDrop(dropArea1, fileInput1, 'image1', preview1);
  setupDragAndDrop(dropArea2, fileInput2, 'image2', preview2);

  // Create collage button
  createButton.addEventListener('click', createCollage);

  // Download button
  downloadButton.addEventListener('click', downloadCollage);

  // New collage button
  newButton.addEventListener('click', resetCollage);

  /**
   * Handles file input change events
   */
  function handleFileChange(event, imageKey, previewElement, dropAreaElement) {
    const file = event.target.files[0];
    if (file) {
      validateAndStoreImage(file, imageKey, previewElement, dropAreaElement);
    }
  }

  /**
   * Sets up drag and drop for an element
   */
  function setupDragAndDrop(dropArea, fileInput, imageKey, previewElement) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('drag-over');
      }, false);
    });

    // Remove highlight when item is dragged out or dropped
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('drag-over');
      }, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      
      fileInput.files = dt.files;
      validateAndStoreImage(file, imageKey, previewElement, dropArea);
    }, false);
  }

  /**
   * Validates and stores an image
   */
  function validateAndStoreImage(file, imageKey, previewElement, dropAreaElement) {
    // Validate file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showError(i18n.t('maxSizeExceeded'));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(i18n.t('invalidFileType'));
      return;
    }

    // Clear error
    clearError();

    // Store the image
    images[imageKey] = file;

    // Show preview
    displayImagePreview(file, previewElement, dropAreaElement);

    // Check if both images are selected
    checkImagesReady();
  }

  /**
   * Displays image preview
   */
  function displayImagePreview(file, previewElement, dropAreaElement) {
    // Clear previous preview
    previewElement.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src); // Free memory
    };
    
    // Add image to preview
    previewElement.appendChild(img);
    
    // Add a success icon indicator
    const successIcon = document.createElement('div');
    successIcon.className = 'success-icon';
    successIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
    previewElement.appendChild(successIcon);
    
    previewElement.classList.add('show');
    
    // Hide original upload elements
    const uploadElements = dropAreaElement.querySelectorAll('svg.upload-icon, p#upload-text1, p#upload-text2, p.drag-text');
    uploadElements.forEach(el => {
      el.style.display = 'none';
    });
    
    // Mark drop area as having an image
    dropAreaElement.classList.add('has-image');
  }

  /**
   * Checks if both images are ready
   */
  function checkImagesReady() {
    if (images.image1 && images.image2) {
      createButton.disabled = false;
    } else {
      createButton.disabled = true;
    }
  }

  /**
   * Shows an error message
   */
  function showError(message) {
    errorMessage.textContent = message;
  }

  /**
   * Clears the error message
   */
  function clearError() {
    errorMessage.textContent = '';
  }

  /**
   * Prevents default event behaviors
   */
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Creates the collage
   */
  async function createCollage() {
    if (!images.image1 || !images.image2) {
      showError(i18n.t('noImagesSelected'));
      return;
    }

    createButton.disabled = true;
    createButton.textContent = i18n.t('creatingCollage');
    clearError();

    try {
      // Convert images to URLs for rendering
      const image1Url = URL.createObjectURL(images.image1);
      const image2Url = URL.createObjectURL(images.image2);

      // Load both images
      const img1 = new Image();
      const img2 = new Image();

      const loadImage = (img, src) => {
        return new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = src;
        });
      };

      await Promise.all([
        loadImage(img1, image1Url),
        loadImage(img2, image2Url)
      ]);

      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Check if there's any text
      const collageText = collageTextInput.value.trim();
      const hasText = collageText.length > 0;
      
      // Detect image orientation
      const isImg1Portrait = img1.height > img1.width;
      const isImg2Portrait = img2.height > img2.width;
      const isImg1Landscape = img1.width > img1.height;
      const isImg2Landscape = img2.width > img2.height;
      
      // Debug: log image dimensions and orientations
      console.log('Image 1:', img1.width + 'x' + img1.height, isImg1Portrait ? 'Portrait' : (isImg1Landscape ? 'Landscape' : 'Square'));
      console.log('Image 2:', img2.width + 'x' + img2.height, isImg2Portrait ? 'Portrait' : (isImg2Landscape ? 'Landscape' : 'Square'));
      
      // Determine layout based on image orientations
      // If both images are landscape (wide), place them on top of each other
      // Otherwise, place them side by side
      const shouldStackVertically = isImg1Landscape && isImg2Landscape;
      
      console.log('Should stack vertically:', shouldStackVertically);
      
      // Set canvas dimensions based on layout
      let width, height, imgSection, textSection;
      
      if (shouldStackVertically) {
        // Vertical stacking for landscape images
        width = Math.max(img1.width, img2.width);
        const totalImageHeight = Math.max(img1.height, img2.height) * 2; // Stack two images
        
        if (hasText) {
          imgSection = totalImageHeight * 0.85;
          textSection = totalImageHeight * 0.15;
          height = imgSection + textSection;
        } else {
          imgSection = totalImageHeight;
          textSection = 0;
          height = imgSection;
        }
      } else {
        // Side by side for portrait images or mixed orientations
        width = Math.max(img1.width, img2.width) * 2;
        const imageHeightMax = Math.max(img1.height, img2.height);
        
        if (hasText) {
          imgSection = imageHeightMax * 0.85;
          textSection = imageHeightMax * 0.15;
          height = imgSection + textSection;
        } else {
          imgSection = imageHeightMax;
          textSection = 0;
          height = imgSection;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Place images based on layout and language direction
      if (shouldStackVertically) {
        // Vertical stacking for landscape images
        const singleImgHeight = imgSection / 2;
        
        if (i18n.language === 'he') {
          // Hebrew - RTL order: image1 on top, image2 on bottom
          ctx.drawImage(img1, 0, 0, width, singleImgHeight);
          ctx.drawImage(img2, 0, singleImgHeight, width, singleImgHeight);
        } else {
          // English - LTR order: image1 on bottom, image2 on top
          ctx.drawImage(img2, 0, 0, width, singleImgHeight);
          ctx.drawImage(img1, 0, singleImgHeight, width, singleImgHeight);
        }
      } else {
        // Side by side for portrait images or mixed orientations
        if (i18n.language === 'he') {
          // Hebrew - RTL order: image1 on left, image2 on right
          ctx.drawImage(img1, 0, 0, width / 2, imgSection);
          ctx.drawImage(img2, width / 2, 0, width / 2, imgSection);
        } else {
          // English - LTR order: image1 on right, image2 on left
          ctx.drawImage(img1, width / 2, 0, width / 2, imgSection);
          ctx.drawImage(img2, 0, 0, width / 2, imgSection);
        }
      }

      // Add text only if there is any
      if (hasText) {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(collageText, width / 2, imgSection + (textSection / 2));
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Show result
      resultImage.src = dataUrl;
      creationPanel.classList.add('hidden');
      resultPanel.classList.remove('hidden');

      // Clean up object URLs
      URL.revokeObjectURL(image1Url);
      URL.revokeObjectURL(image2Url);
    } catch (err) {
      console.error('Error creating collage:', err);
      showError(i18n.t('errorCreatingCollage'));
      createButton.disabled = false;
    } finally {
      createButton.textContent = i18n.t('createCollage');
    }
  }

  /**
   * Downloads the collage
   */
  function downloadCollage() {
    const link = document.createElement('a');
    link.href = resultImage.src;
    link.download = 'collage.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Resets the collage creation
   */
  function resetCollage() {
    // Reset stored images
    images.image1 = null;
    images.image2 = null;
    
    // Reset file inputs
    fileInput1.value = '';
    fileInput2.value = '';
    
    // Reset previews
    preview1.innerHTML = '';
    preview1.classList.remove('show');
    preview2.innerHTML = '';
    preview2.classList.remove('show');
    
    // Reset drop areas
    dropArea1.classList.remove('has-image');
    dropArea2.classList.remove('has-image');
    
    // Show upload elements
    const uploadElements1 = dropArea1.querySelectorAll(':not(.image-preview)');
    uploadElements1.forEach(el => el.style.display = '');
    
    const uploadElements2 = dropArea2.querySelectorAll(':not(.image-preview)');
    uploadElements2.forEach(el => el.style.display = '');
    
    // Reset text input
    collageTextInput.value = '';
    
    // Reset error
    clearError();
    
    // Reset create button
    createButton.disabled = true;
    
    // Show creation panel, hide result panel
    creationPanel.classList.remove('hidden');
    resultPanel.classList.add('hidden');
  }
});