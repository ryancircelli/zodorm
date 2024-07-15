variable "hash_key" {
  type = object({
    name = string
    type = string
  })
}
variable "range_key" {
  type = object({
    name = string
    type = string
  })
  default = null
}

variable "stream" {
  type = object({
    firehoseSize = string
    firehoseTime = string
    httpEndpoint = string
  })
  default = null
}

variable "gsi" {
  type = list(object({
    name = string
    hash_key = object({
      name = string
      type = string
    })
    range_key = optional(object({
      name = string
      type = string
    }))
  }))
  default = []
}

variable "name" {
  type = string
}

variable "app_name" {
  type = string
}

variable "env" {
  type = string
}
