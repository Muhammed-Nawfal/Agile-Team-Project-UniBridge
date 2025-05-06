// src/app/core/icons/icons.ts
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faHandshake,
  faEdit,
  faSave,
  faArrowLeft,
  faTrash,
  faUser,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

export function addIconsToLibrary(): void {
  library.add(faCalendarAlt, faClock, faMapMarkerAlt, faHandshake, faEdit, faSave, faArrowLeft, faTrash, faUser, faInfoCircle);
}
