/**
 * Yandex.Metrica noscript pixel (server component)
 * Renders a tracking pixel for visitors without JavaScript
 */
export function YandexMetricaNoscript() {
  const ymId = process.env.NEXT_PUBLIC_YM_ID || "107712908"
  
  return (
    <noscript>
      <div>
        <img 
          src={`https://mc.yandex.ru/watch/${ymId}`} 
          style={{ position: 'absolute', left: '-9999px' }} 
          alt="" 
        />
      </div>
    </noscript>
  )
}
