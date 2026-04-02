import { useEffect, useRef } from 'react';

interface Props {
  roomName: string;
  displayName: string;
  onClose?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiRoom({ roomName, displayName, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // Load Jitsi script
    const script = document.createElement('script');
    script.src = 'https://8x8.vc/vpaas-magic-cookie-5cceb084adad4c4c881640b95d13eaee/external_api.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.JitsiMeetExternalAPI) {
        apiRef.current = new window.JitsiMeetExternalAPI('8x8.vc', {
          roomName: `vpaas-magic-cookie-5cceb084adad4c4c881640b95d13eaee/${roomName}`,
          parentNode: containerRef.current,
          userInfo: {
            displayName: displayName,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            enableEmailInStats: false,
          },
          interfaceConfigOverwrite: {
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            MOBILE_APP_PROMO: false,
          },
        });

        apiRef.current.addListener('readyToClose', () => {
          onClose?.();
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      apiRef.current?.dispose();
      script.remove();
    };
  }, [roomName, displayName, onClose]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: '460px' }} />
  );
}
