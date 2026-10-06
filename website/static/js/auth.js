(function() {
  // Check if authenticated
  if (sessionStorage.getItem('thoms_auth') === 'true') {
    return; // Allow page to load normally
  }

  // If not authenticated, blur the body and show a teaser modal
  document.addEventListener("DOMContentLoaded", () => {
    // Instead of hiding the body, we blur the main content wrapper
    // We will wrap the existing body content in a blur-container, except for our modal.
    
    const bodyChildren = Array.from(document.body.children);
    const blurWrapper = document.createElement('div');
    blurWrapper.style.filter = 'blur(8px) brightness(0.6)';
    blurWrapper.style.pointerEvents = 'none';
    blurWrapper.style.userSelect = 'none';
    blurWrapper.style.transition = 'filter 0.3s ease';
    
    // Move all existing children into the blur wrapper
    bodyChildren.forEach(child => {
      if (child.tagName !== 'SCRIPT') {
        blurWrapper.appendChild(child);
      }
    });
    
    document.body.insertBefore(blurWrapper, document.body.firstChild);
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // Inject styles and modal
    const style = document.createElement('style');
    style.innerHTML = `
      #auth-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        display: flex; justify-content: center; align-items: center;
        z-index: 999999;
      }
      .auth-box {
        background: #1e293b; border: 1px solid #334155; padding: 2.5rem;
        border-radius: 12px; width: 90%; max-width: 450px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center;
        font-family: 'Inter', sans-serif; color: white;
      }
      .auth-box h2 { color: #06b6d4; margin-top: 0; margin-bottom: 0.75rem; font-size: 1.8rem; font-weight: 800;}
      .auth-box p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5; }
      .auth-box p strong { color: #f8fafc; }
      
      .auth-cta {
        background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: left;
      }
      .auth-cta h4 { margin: 0 0 0.5rem 0; color: #3b82f6; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .auth-cta p { margin: 0; font-size: 0.85rem; }
      
      .auth-input {
        width: 100%; padding: 0.75rem; margin-bottom: 1rem;
        background: #0f172a; border: 1px solid #334155; color: white;
        border-radius: 6px; box-sizing: border-box; outline: none;
        transition: border-color 0.2s;
      }
      .auth-input:focus { border-color: #06b6d4; }
      .auth-btn {
        width: 100%; background: #3b82f6; color: white; padding: 0.75rem;
        border: none; border-radius: 6px; font-weight: bold; cursor: pointer;
        transition: 0.2s; font-size: 1rem;
      }
      .auth-btn:hover { background: #2563eb; }
      .auth-error { color: #ef4444; font-size: 0.85rem; margin-top: 1rem; display: none; }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.innerHTML = `
      <div class="auth-box">
        <h2>Developer Tools</h2>
        <p>You've stumbled into the private workshop. These are live data trackers and toolsets I use daily.</p>
        
        <div class="auth-cta">
          <h4>Want Access?</h4>
          <p>These tools are currently in closed beta. If you are interested in using them, reach out to me on LinkedIn or join my Discord server!</p>
        </div>

        <form id="auth-form">
          <input type="text" id="auth-user" class="auth-input" placeholder="Username" value="ThomsFoolery" required autocomplete="off">
          <input type="password" id="auth-pass" class="auth-input" placeholder="Password" value="connected" required>
          <button type="submit" class="auth-btn">Unlock Tools</button>
          <div id="auth-error" class="auth-error">Incorrect credentials.</div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('auth-user').value;
      const pass = document.getElementById('auth-pass').value;

      if (user === 'ThomsFoolery' && pass === 'connected') {
        sessionStorage.setItem('thoms_auth', 'true');
        location.reload(); // Reload page to restore original state and remove blur
      } else {
        document.getElementById('auth-error').style.display = 'block';
      }
    });
  });
})();
