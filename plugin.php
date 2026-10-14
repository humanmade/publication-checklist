<?php
/**
 * Plugin Name: Publication Checklist
 * Description: Ensure authors meet requirements before publishing.
 * Author: Human Made
 * Author URI: https://humanmade.com/
 * Version: __VERSION__
 */

namespace Altis\Workflow\PublicationChecklist;

const VERSION = '__VERSION__';

require __DIR__ . '/inc/class-status.php';
require __DIR__ . '/inc/namespace.php';

bootstrap();
