import {
  VibeNav,
  VibeHero,
  VibeAbout,
  VibeSpots,
  VibeFood,
  VibeStay,
  VibeCourse,
  VibeSeason,
  VibeGallery,
  VibeFooter,
} from './components/vibe'
import './components/vibe/vibe.css'

export default function App() {
  return (
    <>
      <VibeNav />
      <VibeHero />
      <VibeAbout />
      <VibeSpots />
      <VibeFood />
      <VibeStay />
      <VibeCourse />
      <VibeSeason />
      <VibeGallery />
      <VibeFooter />
    </>
  )
}
