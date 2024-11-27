# **Blur Inactive WhatsApp Chats UserScript**

## **Overview**
This UserScript blurs inactive chats and messages in WhatsApp Web, improving privacy. Chats and messages become clear on hover, ensuring a seamless and secure messaging experience.

---

## **Features**
- **Blur inactive chats:** Automatically blurs all inactive chats in the chat list.
- **Blur messages:** Applies a blur effect to incoming (`message-in`) and outgoing (`message-out`) messages.
- **Hover reveal:** Removes the blur effect when you hover over a chat or message.
- **Dynamic updates:** Detects new messages and ensures the blur effect is applied in real time.

---

## **Installation**

### **1. Install a UserScript Manager**
- Download and install a UserScript manager:
  - [Tampermonkey](https://www.tampermonkey.net/)
  - [Violentmonkey](https://violentmonkey.github.io/)

### **2. Install the Script**
- Click on this link to install the script: [Blur Inactive WhatsApp Chats](https://raw.githubusercontent.com/meer-sagor/whatsApp-chat-blur-script/refs/heads/master/whatsapp-chat-blur.js)

### **3. Activate the Script**
- Open [WhatsApp Web](https://web.whatsapp.com/).
- The script will automatically blur inactive chats and messages.

---

## **Script Code**
```javascript
// ==UserScript==
// @name         Blur Inactive WhatsApp Chats
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Blurs inactive WhatsApp chats and reveals them on hover
// @author       Meer Sagor
// @match        https://web.whatsapp.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=whatsapp.com
// @grant        none
// @license      MIT
// ==/UserScript==
(function () {
  'use strict';

  // Utility function to wait for an element to exist
  function waitForElement(selector, callback, timeout = 10000) {
    const interval = 100; // Check every 100ms
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(intervalId);
        callback(element);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(intervalId);
        console.warn(`Element "${selector}" not found within timeout.`);
      }
    }, interval);
  }

  // Apply blur effect to chats and conversation
  function applyBlurEffect(element) {
    element.style.filter = 'blur(8px)';
    element.style.transition = 'filter 0.3s ease-in-out';
    // Remove blur on hover for conversation panel
    element.addEventListener('mouseenter', () => {
      element.style.filter = 'none';
    });
    element.addEventListener('mouseleave', () => {
      element.style.filter = 'blur(5px)';
    });
  }

  function applyBlurEffectInMessages(messageContainerEl) {
    // Blur messages in the conversation panel
    const inMessages = messageContainerEl.querySelectorAll('.message-in');
    inMessages.forEach((message) => {
      applyBlurEffect(message);
    });
  }

  function applyBlurEffectOutMessages(messageContainerEl) {
    // Blur messages in the conversation panel
    const outMessages = messageContainerEl.querySelectorAll('.message-out');
    outMessages.forEach((message) => {
      applyBlurEffect(message);
    });
  }

  function inactiveChats() {
    const chatList = document.querySelector('[aria-label="Chat list"]');
    const messageContainer = document.querySelector('#main');

    if (!chatList) return; // Exit if chat list is not found

    const chatItems = chatList.querySelectorAll('[role="listitem"]');

    chatItems.forEach((chatItem) => {
      applyBlurEffect(chatItem);
      chatItem.addEventListener('click', () => {
        setTimeout(() => {
          inactiveChats(); // Re-apply blur effects when switching chats
        }, 1000); // Delay to ensure the chat change is registered
      });
    });

    // Blur messages in the conversation panel
    if (messageContainer) {
      applyBlurEffectInMessages(messageContainer);
      applyBlurEffectOutMessages(messageContainer);
    }
  }

  function observeNewMessages(container) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.getAttribute('role') === 'row') {
              // Apply blur to newly added messages
              const inMessages = node.querySelectorAll('.message-in');
              inMessages.forEach(applyBlurEffect);

              const outMessages = node.querySelectorAll('.message-out');
              outMessages.forEach(applyBlurEffect);
            }
          });
        }
      });
    });

    observer.observe(container, { childList: true, subtree: true });
  }

  function observeChatChanges() {
    waitForElement('[aria-label="Chat list"]', (chatContainer) => {
      const observer = new MutationObserver(applyBlurEffect);
      observer.observe(chatContainer, { childList: true, subtree: true });
      inactiveChats(); // Initial call to apply blur
    });

    waitForElement('#main', (container) => {
      observeNewMessages(container); // Observe new messages
      inactiveChats(); // Initial call to apply blur
    });
  }

  // Wait for DOM to be fully loaded
  window.addEventListener('load', () => {
    setTimeout(observeChatChanges, 3000);
  });
})();
```

## License
This script is licensed under the [MIT License](https://github.com/meer-sagor/whatsApp-chat-blur-script?tab=MIT-1-ov-file) You can use, modify, and distribute it freely, provided attribution is given.

## Contributing
Contributions are welcome! Submit [issues](https://github.com/meer-sagor/whatsApp-chat-blur-script/issues) or pull requests to improve this script. Visit the GitHub repository for more details.