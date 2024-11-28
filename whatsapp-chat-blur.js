// ==UserScript==
// @name         Blur Inactive WhatsApp Chats
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Blurs inactive WhatsApp chats and reveals them on hover
// @author       Meer Sagor
// @match        https://web.whatsapp.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=whatsapp.com
// @grant        none
// @license      MIT
// ==/UserScript==
(function () {
  'use strict';

  /**
   * Utility function to wait for an element to exist
   */
  function waitForElement(selector, callback, timeout = 10000) {
    const interval = 100;
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

  /**
   * Apply blur effect to an element
   */
  function applyBlurEffect(element) {
    if (!element.style.filter.includes('blur')) {
      element.style.filter = 'blur(8px)';
      element.style.transition = 'filter 0.3s ease-in-out';
    }
    element.addEventListener('mouseenter', () => (element.style.filter = 'none'));
    element.addEventListener('mouseleave', () => (element.style.filter = 'blur(8px)'));
  }

  /**
   * Blur chat items
   */
  function blurChatList() {
    const chatList = document.querySelector('[aria-label="Chat list"]');
    if (!chatList) return;

    const chatItems = chatList.querySelectorAll('[role="listitem"]');
    chatItems.forEach((chatItem) => applyBlurEffect(chatItem));
  }

  /**
   * Blur messages inside the active conversation
   */
  function blurMessages() {
    const messageContainer = document.querySelector('#main');
    if (!messageContainer) return;

    const messages = messageContainer.querySelectorAll('.message-in, .message-out');
    messages.forEach((message) => applyBlurEffect(message));
  }

  /**
   * Observe changes in the chat list
   */
  function observeChatList() {
    waitForElement('[aria-label="Chat list"]', (chatContainer) => {
      const chatObserver = new MutationObserver(() => {
        blurChatList(); // Apply blur when chat list changes
      });
      chatObserver.observe(chatContainer, { childList: true, subtree: true });
      blurChatList(); // Initial blur
    });
  }

  /**
   * Observe new messages in the conversation
   */
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

  /**
   * Observe changes in the message container
   */
  function observeMessageContainer() {
    waitForElement('#main', (messageContainer) => {
      const messageObserver = new MutationObserver(() => {
        blurMessages(); // Apply blur when messages change
      });
      messageObserver.observe(messageContainer, { childList: true, subtree: true });
      observeNewMessages(messageContainer); // Additional observation for dynamic messages
      blurMessages(); // Initial blur
    });
  }

  /**
   * Reapply blur effect on tab visibility change
   */
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      blurChatList();
      blurMessages();
    }
  }

  // Initialize the script
  window.addEventListener('load', () => {
    setTimeout(() => {
      observeChatList();
      observeMessageContainer();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }, 3000);
  });
})();
