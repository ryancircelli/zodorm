variable "stream" {
  type = object({
    firehoseSize = string
    firehoseTime = string
    httpEndpoint = string
  })
  default = null
}

variable "table_name" {
  type = string
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
