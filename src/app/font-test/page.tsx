export default function FontTest() {
  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Font Test Page - Graphik
        </h1>
        
        <div className="space-y-4">
          <p className="text-lg">
            This text should be displayed in the Graphik font. 
            The font is loaded from /fonts/Graphik-Regular.otf
          </p>
          
          <p className="font-sans text-lg">
            This uses font-sans class (should be Graphik)
          </p>
          
          <p className="font-graphik text-lg">
            This uses font-graphik class (should be Graphik)
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Graphik font features:
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Modern sans-serif typeface</li>
              <li>• Clean and readable</li>
              <li>• Works well for dashboards</li>
              <li>• Multiple weights supported</li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Card Title</h3>
            <p>This is card content with Graphik font.</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Another Card</h3>
            <p>More text to test the font rendering.</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Font Stack Information</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm">
            <p>Font family: 'Graphik', ui-sans-serif, system-ui, sans-serif</p>
            <p>Font file: /fonts/Graphik-Regular.otf</p>
            <p>Format: OpenType</p>
            <p>Display: swap</p>
          </div>
        </div>
      </div>
    </div>
  );
}