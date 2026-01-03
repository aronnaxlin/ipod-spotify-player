import React, { useState, useEffect } from 'react';
import { IpodAppComponent } from './ipod/components/IpodAppComponent';
import { Toaster } from 'sonner';

// Simple Error Boundary
class ErrorBoundary extends React.Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 bg-white/90 h-screen rounded-xl">
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isWindowOpen, setIsWindowOpen] = useState(true);

  const handleClose = () => {
    setIsWindowOpen(false);
    console.log("Close requested");
    // In a real Electron app, you'd send an IPC message here to close the window
  };

  return (
    <ErrorBoundary>
      <div className="app-container w-screen h-screen flex justify-center items-center bg-transparent">
        <IpodAppComponent
          isWindowOpen={isWindowOpen}
          onClose={handleClose}
          isForeground={true}
        />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;