import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

// Import the icons you need from the solid package
import {
  faPlus,
  faList,
  faTrophy,
  faSync,
  faClock,
  faCheckCircle,
  faTimesCircle,
  // Add any additional icons your app is using
  faTasks,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';

// Function to initialize the Font Awesome library
export function initFontAwesomeLibrary(library: FaIconLibrary): void {
  // Register all icons you'll use throughout your app
  library.addIcons(
    faPlus,
    faList,
    faTrophy,
    faSync,
    faClock,
    faCheckCircle,
    faTimesCircle,
    // Additional icons
    faTasks,
    faExclamationCircle,
  );
}
