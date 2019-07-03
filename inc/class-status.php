<?php

namespace HM\PublicationChecklist;

class Status {
	const COMPLETE = 'complete';
	const INCOMPLETE = 'incomplete';
	const INFO = 'info';

	/**
	 * @var string
	 */
	protected $status;

	/**
	 * @var string
	 */
	protected $message;

	public function __construct( string $status, string $message ) {
		$this->status = $status;
		$this->message = $message;
	}

	public function get_status() : string {
		return $this->status;
	}

	public function get_message() : string {
		return $this->message;
	}
}
