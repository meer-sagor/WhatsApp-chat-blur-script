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
      element.style.filter = 'blur(8px)';
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
